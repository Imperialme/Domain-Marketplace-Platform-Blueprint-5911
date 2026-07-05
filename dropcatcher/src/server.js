import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CONFIG_PATH, ROOT, loadConfig } from './config.js';
import { loadState, saveState, getDomainState, recordTransition } from './state.js';
import { log, logBuffer } from './log.js';
import { notify } from './notify.js';
import { Engine } from './engine.js';
import { rdapLookup, phaseFromRdap } from './rdap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DASHBOARD_HTML = path.join(__dirname, 'web', 'dashboard.html');

/* ---------- raw config helpers (write secrets to disk, not env refs) ---------- */

function readRawConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.copyFileSync(path.join(ROOT, 'config.example.json'), CONFIG_PATH);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function writeRawConfig(raw) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(raw, null, 2) + '\n', { mode: 0o600 });
}

/* ---------- auth: password set on first visit, HMAC-signed session cookie ---------- */

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

function ensureWebSecrets(raw) {
  raw.web = raw.web || {};
  if (!raw.web.cookieSecret) {
    raw.web.cookieSecret = crypto.randomBytes(32).toString('hex');
    writeRawConfig(raw);
  }
  return raw;
}

function signSession(secret) {
  const exp = Date.now() + 7 * 24 * 3600_000;
  const sig = crypto.createHmac('sha256', secret).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}

function verifySession(cookieHeader, secret) {
  const m = /(?:^|;\s*)dcsession=([^;]+)/.exec(cookieHeader || '');
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expect = crypto.createHmac('sha256', secret).update(exp).digest('hex');
  return sig.length === expect.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
}

/* ---------- tiny http helpers ---------- */

function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

/**
 * Session cookie attributes. When the dashboard is reached over https (via a
 * reverse proxy setting X-Forwarded-Proto), use SameSite=None so the login
 * also works inside the marketplace site's iframe; plain http gets Lax,
 * which works for direct/new-tab access.
 */
function sessionCookie(req, value) {
  const https = (req.headers['x-forwarded-proto'] || '').includes('https');
  const sameSite = https ? 'None; Secure' : 'Lax';
  return `dcsession=${value}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=604800`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 64 * 1024) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const VALID_DOMAIN = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{2,63})+$/;

/* ---------- server ---------- */

export function startServer(port = 8053, host = '0.0.0.0') {
  const engine = new Engine();
  ensureWebSecrets(readRawConfig());

  // Naive login throttle: 10 attempts/minute across the board.
  let loginAttempts = [];

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const route = `${req.method} ${url.pathname}`;

    try {
      /* --- unauthenticated --- */
      if (route === 'GET /') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(DASHBOARD_HTML));
        return;
      }
      if (route === 'GET /api/setup-status') {
        const raw = readRawConfig();
        return json(res, 200, {
          needsPassword: !raw.web?.passwordHash,
          loggedIn: !!raw.web?.passwordHash && verifySession(req.headers.cookie, raw.web.cookieSecret),
        });
      }
      if (route === 'POST /api/setup') {
        const raw = ensureWebSecrets(readRawConfig());
        if (raw.web.passwordHash) return json(res, 403, { error: 'Password already set. Log in instead.' });
        const { password } = await readBody(req);
        if (!password || password.length < 8) return json(res, 400, { error: 'Password must be at least 8 characters.' });
        raw.web.salt = crypto.randomBytes(16).toString('hex');
        raw.web.passwordHash = hashPassword(password, raw.web.salt);
        writeRawConfig(raw);
        return json(res, 200, { ok: true }, {
          'Set-Cookie': sessionCookie(req, signSession(raw.web.cookieSecret)),
        });
      }
      if (route === 'POST /api/login') {
        const now = Date.now();
        loginAttempts = loginAttempts.filter((t) => now - t < 60_000);
        if (loginAttempts.length >= 10) return json(res, 429, { error: 'Too many attempts — wait a minute.' });
        loginAttempts.push(now);
        const raw = readRawConfig();
        const { password } = await readBody(req);
        if (!raw.web?.passwordHash || hashPassword(password || '', raw.web.salt) !== raw.web.passwordHash) {
          return json(res, 401, { error: 'Wrong password.' });
        }
        return json(res, 200, { ok: true }, {
          'Set-Cookie': sessionCookie(req, signSession(raw.web.cookieSecret)),
        });
      }

      /* --- everything below requires a valid session --- */
      const raw = readRawConfig();
      if (!raw.web?.passwordHash || !verifySession(req.headers.cookie, raw.web.cookieSecret)) {
        return json(res, 401, { error: 'Not logged in.' });
      }

      if (route === 'GET /api/status') {
        const cfg = loadConfig();
        const state = loadState();
        const domains = cfg.watchlist.map((entry) => {
          const d = getDomainState(state, entry.domain);
          return {
            domain: entry.domain,
            maxPrice: entry.maxPrice,
            phase: d.phase,
            expirationDate: d.expirationDate,
            lastCheckedAt: d.lastCheckedAt,
            caughtAt: d.caughtAt,
            dropWindowUtc: entry.dropWindowUtc,
          };
        });
        return json(res, 200, {
          engine: engine.status(),
          registrar: cfg.registrar,
          hasApiKey: !!(cfg.registrar === 'dynadot' ? cfg.dynadot?.apiKey : cfg.godaddy?.apiKey),
          notifications: {
            telegram: !!(cfg.notify?.telegram?.botToken && cfg.notify?.telegram?.chatId),
            webhook: !!cfg.notify?.webhookUrl,
          },
          domains,
        });
      }

      if (route === 'POST /api/settings') {
        const body = await readBody(req);
        if (body.dynadotApiKey !== undefined) {
          raw.dynadot = { ...raw.dynadot, apiKey: body.dynadotApiKey.trim() };
          raw.registrar = 'dynadot';
        }
        if (body.telegramBotToken !== undefined || body.telegramChatId !== undefined) {
          raw.notify = raw.notify || {};
          raw.notify.telegram = {
            botToken: (body.telegramBotToken ?? raw.notify.telegram?.botToken ?? '').trim(),
            chatId: String(body.telegramChatId ?? raw.notify.telegram?.chatId ?? '').trim(),
          };
        }
        if (body.webhookUrl !== undefined) {
          raw.notify = raw.notify || {};
          raw.notify.webhookUrl = body.webhookUrl.trim();
        }
        writeRawConfig(raw);
        log.info('settings updated from dashboard');
        return json(res, 200, { ok: true });
      }

      if (route === 'POST /api/watchlist') {
        const body = await readBody(req);
        const domain = String(body.domain || '').toLowerCase().trim();
        if (!VALID_DOMAIN.test(domain)) return json(res, 400, { error: `"${domain}" doesn't look like a valid domain.` });
        raw.watchlist = raw.watchlist || [];
        if (raw.watchlist.some((e) => (typeof e === 'string' ? e : e.domain) === domain)) {
          return json(res, 409, { error: `${domain} is already being watched.` });
        }
        const entry = { domain };
        if (body.maxPrice) entry.maxPrice = Number(body.maxPrice);
        raw.watchlist.push(entry);
        writeRawConfig(raw);
        log.info(`dashboard: now watching ${domain}`);
        // Immediate first check so the UI shows a phase within seconds.
        rdapCheckOnce(domain).catch(() => {});
        return json(res, 200, { ok: true });
      }

      if (route === 'DELETE /api/watchlist') {
        const domain = String(url.searchParams.get('domain') || '').toLowerCase().trim();
        raw.watchlist = (raw.watchlist || []).filter((e) => (typeof e === 'string' ? e : e.domain) !== domain);
        writeRawConfig(raw);
        log.info(`dashboard: stopped watching ${domain}`);
        return json(res, 200, { ok: true });
      }

      if (route === 'POST /api/engine/start') {
        engine.start();
        return json(res, 200, { ok: true });
      }
      if (route === 'POST /api/engine/stop') {
        engine.cancelBurst();
        await engine.stop();
        return json(res, 200, { ok: true });
      }
      if (route === 'POST /api/catch') {
        const { domain } = await readBody(req);
        if (engine.activeBurst) return json(res, 409, { error: `Already bursting on ${engine.activeBurst}.` });
        engine.forceCatch(String(domain || '').toLowerCase().trim())
          .then((r) => log.info(`manual catch ${domain}: ${r.success ? 'CAUGHT' : r.reason}`))
          .catch((err) => log.error(`manual catch ${domain} failed: ${err.message}`));
        return json(res, 200, { ok: true, message: 'Burst started — watch the activity log.' });
      }
      if (route === 'POST /api/catch/cancel') {
        engine.cancelBurst();
        return json(res, 200, { ok: true });
      }

      if (route === 'POST /api/test-notification') {
        await notify(loadConfig(), 'test notification', 'If you can read this, notifications are working. 🎉');
        return json(res, 200, { ok: true });
      }

      if (route === 'GET /api/log') {
        return json(res, 200, { entries: logBuffer.slice(-120) });
      }

      return json(res, 404, { error: 'not found' });
    } catch (err) {
      log.error(`http ${route}: ${err.message || err}`);
      return json(res, 500, { error: String(err.message || err) });
    }
  });

  server.listen(port, host, () => {
    log.info(`dashboard listening on http://${host}:${port}`);
    if (host === '0.0.0.0') log.info(`open http://YOUR-SERVER-IP:${port} in a browser to finish setup`);
  });

  // The engine always runs; with no API key it just monitors, and picks the
  // key up automatically on the sweep after you save it in the dashboard.
  engine.start();
  return { server, engine };
}

async function rdapCheckOnce(domain) {
  const result = await rdapLookup(domain);
  if (result.error) return;
  const state = loadState();
  const d = getDomainState(state, domain);
  d.lastCheckedAt = new Date().toISOString();
  d.lastRdapStatus = result.statuses;
  if (result.expirationDate) d.expirationDate = result.expirationDate;
  const phase = phaseFromRdap(result);
  if (phase) recordTransition(state, domain, phase);
  saveState(state);
}
