#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CONFIG_PATH, loadConfig, saveConfig } from './config.js';
import { loadState, getDomainState } from './state.js';
import { rdapLookup, phaseFromRdap } from './rdap.js';
import { createRegistrar } from './registrars/index.js';
import { monitorSweep, runDaemon } from './monitor.js';
import { burstCatch } from './catcher.js';
import { log } from './log.js';

const [, , command, ...args] = process.argv;

const HELP = `dropcatcher — self-hosted domain drop catcher

Usage:
  node src/cli.js init                 Create config.json from the example
  node src/cli.js add <domain> [max]   Watch a domain (optional max price)
  node src/cli.js remove <domain>      Stop watching a domain
  node src/cli.js list                 Show watchlist + last known phase
  node src/cli.js check <domain>       One-off RDAP + availability check
  node src/cli.js monitor-once         Single monitoring sweep (cron/Netlify)
  node src/cli.js run                  Long-running daemon (VPS: pm2/systemd)
  node src/cli.js web [port]           Daemon + point-and-click dashboard (default port 8053)
  node src/cli.js catch <domain>       Force burst mode NOW, ignore window

Environment:
  DYNADOT_API_KEY / GODADDY_API_KEY+GODADDY_API_SECRET, TELEGRAM_BOT_TOKEN
  DROPCATCHER_CONFIG / DROPCATCHER_STATE to relocate config/state files.
`;

async function main() {
  switch (command) {
    case 'init': {
      if (fs.existsSync(CONFIG_PATH)) {
        console.log(`config already exists: ${CONFIG_PATH}`);
        return;
      }
      fs.copyFileSync(path.join(ROOT, 'config.example.json'), CONFIG_PATH);
      console.log(`created ${CONFIG_PATH} — edit the watchlist and set DYNADOT_API_KEY.`);
      return;
    }

    case 'add': {
      const domain = (args[0] || '').toLowerCase().trim();
      if (!domain.includes('.')) throw new Error('usage: add <domain> [maxPrice]');
      const cfg = loadConfig();
      const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      raw.watchlist = raw.watchlist || [];
      if (raw.watchlist.some((e) => (typeof e === 'string' ? e : e.domain) === domain)) {
        console.log(`${domain} already watched`);
        return;
      }
      const entry = { domain };
      if (args[1]) entry.maxPrice = Number(args[1]);
      raw.watchlist.push(entry);
      saveConfig(raw);
      console.log(`watching ${domain} (maxPrice ${entry.maxPrice ?? cfg.defaults.maxPrice})`);
      return;
    }

    case 'remove': {
      const domain = (args[0] || '').toLowerCase().trim();
      const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      const before = (raw.watchlist || []).length;
      raw.watchlist = (raw.watchlist || []).filter(
        (e) => (typeof e === 'string' ? e : e.domain) !== domain
      );
      saveConfig(raw);
      console.log(before === raw.watchlist.length ? `${domain} was not watched` : `removed ${domain}`);
      return;
    }

    case 'list': {
      const cfg = loadConfig();
      const state = loadState();
      for (const entry of cfg.watchlist) {
        const d = getDomainState(state, entry.domain);
        console.log(
          `${entry.domain.padEnd(30)} phase=${d.phase.padEnd(16)} expires=${d.expirationDate || '?'} lastChecked=${d.lastCheckedAt || 'never'}`
        );
      }
      if (!cfg.watchlist.length) console.log('(watchlist empty — use "add <domain>")');
      return;
    }

    case 'check': {
      const domain = (args[0] || '').toLowerCase().trim();
      if (!domain.includes('.')) throw new Error('usage: check <domain>');
      const cfg = loadConfig();
      const rdap = await rdapLookup(domain);
      console.log(`RDAP phase: ${phaseFromRdap(rdap) ?? `inconclusive (${rdap.error})`}`);
      console.log(`  statuses: ${rdap.statuses.join(', ') || '(none)'}`);
      console.log(`  expires:  ${rdap.expirationDate || '?'}`);
      try {
        const registrar = createRegistrar(cfg);
        const { available, price } = await registrar.checkAvailability(domain);
        console.log(`Registrar (${cfg.registrar}): available=${available} price=${price ?? '?'}`);
      } catch (err) {
        console.log(`Registrar check skipped: ${err.message}`);
      }
      return;
    }

    case 'monitor-once': {
      const cfg = loadConfig();
      let registrar = null;
      try {
        registrar = createRegistrar(cfg);
      } catch (err) {
        log.warn(`registrar unavailable, monitoring only: ${err.message}`);
      }
      const actionable = await monitorSweep(cfg, { registrar });
      log.info(`sweep done, ${actionable.length} actionable domain(s)`);
      return;
    }

    case 'run': {
      const cfg = loadConfig();
      const registrar = createRegistrar(cfg);
      await runDaemon(cfg, registrar);
      return;
    }

    case 'web': {
      // Config is auto-created on first run; everything else (API key,
      // watchlist, notifications) is configured in the browser.
      if (!fs.existsSync(CONFIG_PATH)) {
        fs.copyFileSync(path.join(ROOT, 'config.example.json'), CONFIG_PATH);
      }
      const { startServer } = await import('./server.js');
      startServer(Number(args[0]) || Number(process.env.PORT) || 8053, process.env.HOST || '0.0.0.0');
      return;
    }

    case 'catch': {
      const domain = (args[0] || '').toLowerCase().trim();
      if (!domain.includes('.')) throw new Error('usage: catch <domain>');
      const cfg = loadConfig();
      const entry = cfg.watchlist.find((e) => e.domain === domain) || {
        domain,
        maxPrice: cfg.defaults.maxPrice,
        registrationYears: cfg.defaults.registrationYears,
        dropWindowUtc: cfg.defaults.dropWindowUtc,
      };
      const registrar = createRegistrar(cfg);
      const res = await burstCatch(registrar, cfg, entry, { ignoreWindow: true });
      console.log(res.success ? `CAUGHT ${domain}` : `did not catch ${domain}: ${res.reason}`);
      process.exitCode = res.success ? 0 : 1;
      return;
    }

    default:
      console.log(HELP);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
