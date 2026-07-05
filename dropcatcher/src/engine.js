import { log } from './log.js';
import { loadConfig } from './config.js';
import { createRegistrar } from './registrars/index.js';
import { monitorSweep } from './monitor.js';
import { burstCatch, inDropWindow } from './catcher.js';
import { loadState, saveState, getDomainState, recordTransition } from './state.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Start/stoppable wrapper around the monitor+catch loop, used by the web
 * dashboard. Reloads config on every cycle so settings/watchlist changes
 * made in the UI take effect without a restart.
 */
export class Engine {
  constructor() {
    this.running = false;
    this.lastSweepAt = null;
    this.lastError = null;
    this.activeBurst = null; // domain currently in burst mode
    this._loop = null;
  }

  status() {
    return {
      running: this.running,
      lastSweepAt: this.lastSweepAt,
      lastError: this.lastError,
      activeBurst: this.activeBurst,
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastError = null;
    this._loop = this._run().catch((err) => {
      this.lastError = String(err.message || err);
      this.running = false;
      log.error(`engine crashed: ${this.lastError}`);
    });
    log.info('engine started');
  }

  async stop() {
    if (!this.running) return;
    this.running = false;
    log.info('engine stopping…');
    await this._loop;
  }

  /** Force burst mode for one domain right now, ignoring the drop window. */
  async forceCatch(domain) {
    const cfg = loadConfig();
    const registrar = createRegistrar(cfg);
    const entry =
      cfg.watchlist.find((e) => e.domain === domain) || {
        domain,
        maxPrice: cfg.defaults.maxPrice,
        registrationYears: cfg.defaults.registrationYears,
        dropWindowUtc: cfg.defaults.dropWindowUtc,
      };
    this.activeBurst = domain;
    this._cancelBurst = false;
    try {
      const res = await burstCatch(registrar, cfg, entry, {
        ignoreWindow: true,
        shouldStop: () => this._cancelBurst,
      });
      if (res.success) this._markCaught(domain);
      return res;
    } finally {
      this.activeBurst = null;
    }
  }

  /** Cancel a manual "catch now" burst from the dashboard. */
  cancelBurst() {
    this._cancelBurst = true;
  }

  _markCaught(domain) {
    const state = loadState();
    recordTransition(state, domain, 'caught');
    getDomainState(state, domain).caughtAt = new Date().toISOString();
    saveState(state);
  }

  async _run() {
    while (this.running) {
      let cfg;
      let registrar = null;
      try {
        cfg = loadConfig();
        try {
          registrar = createRegistrar(cfg);
        } catch (err) {
          log.warn(`registrar not configured yet (${err.message}) — monitoring only`);
        }

        const actionable = await monitorSweep(cfg, { registrar });
        this.lastSweepAt = new Date().toISOString();
        this.lastError = null;

        if (registrar) {
          const pendingDeletes = actionable.filter((a) => a.phase === 'pendingDelete');
          for (const { entry } of pendingDeletes) {
            if (!this.running) break;
            if (!inDropWindow(entry)) continue;
            this.activeBurst = entry.domain;
            try {
              const res = await burstCatch(registrar, cfg, entry, {
                shouldStop: () => !this.running,
              });
              if (res.success) this._markCaught(entry.domain);
            } finally {
              this.activeBurst = null;
            }
          }
        }
      } catch (err) {
        this.lastError = String(err.message || err);
        log.error(`sweep failed: ${this.lastError}`);
      }

      // Sweep every minute when a drop is near; otherwise use the configured
      // interval. Wake every second so stop() is responsive.
      const nearDrop = this.activeBurst !== null;
      const intervalMs = cfg
        ? (nearDrop ? 60_000 : cfg.monitor.intervalMinutes * 60_000)
        : 60_000;
      const until = Date.now() + intervalMs;
      while (this.running && Date.now() < until) await sleep(1000);
    }
    log.info('engine stopped');
  }
}
