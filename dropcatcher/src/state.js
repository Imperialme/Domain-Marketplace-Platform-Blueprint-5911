import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './config.js';

const STATE_PATH = process.env.DROPCATCHER_STATE || path.join(ROOT, 'state.json');

/**
 * Per-domain lifecycle: unknown -> active -> expired/grace -> redemptionPeriod
 * -> pendingDelete -> dropWatch -> caught | missed
 */
export function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { domains: {} };
  }
}

export function saveState(state) {
  try {
    const tmp = STATE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n');
    fs.renameSync(tmp, STATE_PATH);
  } catch (err) {
    // Read-only filesystems (e.g. Netlify functions) can't persist state;
    // monitoring still works, but set DROPCATCHER_STATE=/tmp/state.json there.
    console.warn(`state not persisted (${err.message})`);
  }
}

export function getDomainState(state, domain) {
  if (!state.domains[domain]) {
    state.domains[domain] = {
      phase: 'unknown',
      lastRdapStatus: null,
      expirationDate: null,
      lastCheckedAt: null,
      caughtAt: null,
      history: [],
    };
  }
  return state.domains[domain];
}

export function recordTransition(state, domain, phase, note) {
  const d = getDomainState(state, domain);
  if (d.phase !== phase) {
    d.history.push({ at: new Date().toISOString(), from: d.phase, to: phase, note: note || '' });
    // Keep history bounded so the state file never grows unbounded.
    if (d.history.length > 100) d.history = d.history.slice(-100);
    d.phase = phase;
    return true;
  }
  return false;
}
