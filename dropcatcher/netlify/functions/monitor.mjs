// Netlify Scheduled Function: hourly RDAP monitoring + notifications.
//
// This is the *watchtower*, not the catcher. Netlify functions time out in
// seconds and can't hold the tight polling loop a real drop catch needs —
// run `node src/cli.js run` on your VPS for that. This function keeps you
// informed (Telegram/webhook) even if the VPS is down, and will still fire
// an opportunistic registration attempt if it finds a domain already dropped.
//
// Setup (see dropcatcher/README.md):
//   1. Copy dropcatcher/netlify/netlify.toml settings into your site config.
//   2. Set env vars in Netlify UI: DROPCATCHER_CONFIG_JSON (the full JSON of
//      your config), DYNADOT_API_KEY, TELEGRAM_BOT_TOKEN, etc.
import { monitorSweep } from '../../src/monitor.js';
import { createRegistrar } from '../../src/registrars/index.js';

export default async () => {
  if (!process.env.DROPCATCHER_CONFIG_JSON) {
    return new Response('DROPCATCHER_CONFIG_JSON env var not set', { status: 500 });
  }
  const cfg = normalize(JSON.parse(process.env.DROPCATCHER_CONFIG_JSON));

  let registrar = null;
  try {
    registrar = createRegistrar(cfg);
  } catch {
    // No API key configured on Netlify — monitor-only mode is fine.
  }
  const actionable = await monitorSweep(cfg, { registrar });
  return Response.json({ ok: true, actionable: actionable.map((a) => a.entry.domain) });
};

export const config = { schedule: '@hourly' };

// Netlify's filesystem is ephemeral, so config defaults are applied here
// instead of via config.js (which reads from disk).
function normalize(cfg) {
  cfg.defaults = { maxPrice: 50, registrationYears: 1, dropWindowUtc: { start: '00:00', end: '23:59' }, ...cfg.defaults };
  cfg.monitor = { intervalMinutes: 60, ...cfg.monitor };
  cfg.catch = { pollMs: 1500, registerRetries: 8, maxBurstHours: 12, ...cfg.catch };
  cfg.watchlist = (cfg.watchlist || []).map((e) => (typeof e === 'string' ? { domain: e } : e));
  for (const e of cfg.watchlist) {
    e.domain = e.domain.toLowerCase().trim();
    e.maxPrice = e.maxPrice ?? cfg.defaults.maxPrice;
    e.registrationYears = e.registrationYears ?? cfg.defaults.registrationYears;
    e.dropWindowUtc = e.dropWindowUtc ?? cfg.defaults.dropWindowUtc;
  }
  resolveEnv(cfg);
  return cfg;
}

function resolveEnv(obj) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v.startsWith('env:')) obj[k] = process.env[v.slice(4)] || '';
    else if (v && typeof v === 'object') resolveEnv(v);
  }
}
