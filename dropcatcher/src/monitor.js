import { log } from './log.js';
import { notify } from './notify.js';
import { rdapLookup, phaseFromRdap } from './rdap.js';
import { loadState, saveState, getDomainState, recordTransition } from './state.js';
import { attemptRegistration, burstCatch, inDropWindow } from './catcher.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PHASE_EXPLAIN = {
  active: 'registered and in good standing',
  graceOrAutoRenew: 'expired, in auto-renew/grace — owner can still renew cheaply',
  redemptionPeriod: 'in redemption (~30 days) — owner can still restore for a fee; drop is getting close',
  pendingRestore: 'owner has requested restore — probably not dropping',
  pendingDelete: 'PENDING DELETE — drops in ~5 days, catcher will burst during the drop window',
  droppable: 'no registry record — available to register right now',
};

/**
 * One monitoring sweep: RDAP every watched domain, record phase transitions,
 * notify on changes, and return the entries that need immediate action.
 */
export async function monitorSweep(cfg, { registrar = null } = {}) {
  const state = loadState();
  const actionable = [];

  for (const entry of cfg.watchlist) {
    const d = getDomainState(state, entry.domain);
    if (d.phase === 'caught') continue;

    const result = await rdapLookup(entry.domain);
    d.lastCheckedAt = new Date().toISOString();
    if (result.error) {
      log.warn(`${entry.domain}: RDAP inconclusive (${result.error}), keeping phase "${d.phase}"`);
      continue;
    }
    d.lastRdapStatus = result.statuses;
    if (result.expirationDate) d.expirationDate = result.expirationDate;

    const phase = phaseFromRdap(result);
    const changed = recordTransition(state, entry.domain, phase);
    log.info(`${entry.domain}: ${phase}${result.expirationDate ? ` (expires ${result.expirationDate})` : ''}${changed ? ' [CHANGED]' : ''}`);

    if (changed) {
      await notify(cfg, `${entry.domain} → ${phase}`, PHASE_EXPLAIN[phase] || phase);
    }
    if (phase === 'droppable' || phase === 'pendingDelete') {
      actionable.push({ entry, phase });
    }

    // If it's droppable right now and we have a registrar, grab it immediately
    // even during a routine sweep — don't wait for the daemon's burst pass.
    if (phase === 'droppable' && registrar) {
      const res = await attemptRegistration(registrar, cfg, entry);
      if (res.success) {
        recordTransition(state, entry.domain, 'caught');
        getDomainState(state, entry.domain).caughtAt = new Date().toISOString();
      }
    }

    await sleep(1000); // be polite to the shared RDAP bootstrap service
  }

  saveState(state);
  return actionable;
}

/**
 * The long-running daemon for the VPS:
 *  - hourly-ish RDAP sweeps to track lifecycle phases
 *  - when a domain hits pendingDelete and the UTC drop window opens,
 *    switch into burst mode until it's caught or the window closes.
 */
export async function runDaemon(cfg, registrar) {
  log.info(`daemon starting: ${cfg.watchlist.length} domain(s) watched, registrar=${cfg.registrar}`);
  for (;;) {
    let actionable = [];
    try {
      actionable = await monitorSweep(cfg, { registrar });
    } catch (err) {
      log.error(`sweep failed: ${err.message || err}`);
    }

    const pendingDeletes = actionable.filter((a) => a.phase === 'pendingDelete');
    for (const { entry } of pendingDeletes) {
      if (!inDropWindow(entry)) continue;
      const res = await burstCatch(registrar, cfg, entry);
      if (res.success) {
        const state = loadState();
        recordTransition(state, entry.domain, 'caught');
        getDomainState(state, entry.domain).caughtAt = new Date().toISOString();
        saveState(state);
      }
    }

    // While a pendingDelete domain is approaching its window, poll frequently
    // so we enter the window within a minute; otherwise relax to the
    // configured monitor interval.
    const nearDrop = pendingDeletes.length > 0;
    const waitMs = nearDrop ? 60_000 : cfg.monitor.intervalMinutes * 60_000;
    log.info(`next sweep in ${Math.round(waitMs / 1000)}s`);
    await sleep(waitMs);
  }
}
