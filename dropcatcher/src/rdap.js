import { log } from './log.js';

/**
 * RDAP is the free, structured successor to WHOIS. rdap.org bootstraps to the
 * correct registry server for any TLD (.me -> Identity Digital's RDAP, etc.),
 * so we don't hardcode per-TLD endpoints.
 */
const RDAP_BASE = process.env.RDAP_BASE || 'https://rdap.org/domain/';

/**
 * @returns {Promise<{
 *   found: boolean, statuses: string[], expirationDate: string|null,
 *   deletionDate: string|null, raw?: object, error?: string
 * }>}
 * found=false (HTTP 404) means the registry has no record — the domain has
 * dropped (or was never registered) and is very likely available right now.
 */
export async function rdapLookup(domain) {
  const url = RDAP_BASE + encodeURIComponent(domain);
  let res;
  try {
    res = await fetch(url, {
      headers: { accept: 'application/rdap+json' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    return { found: true, statuses: [], expirationDate: null, deletionDate: null, error: String(err) };
  }

  if (res.status === 404) {
    return { found: false, statuses: [], expirationDate: null, deletionDate: null };
  }
  if (res.status === 429) {
    log.warn(`RDAP rate-limited for ${domain}; backing off`);
    return { found: true, statuses: [], expirationDate: null, deletionDate: null, error: 'rate-limited' };
  }
  if (!res.ok) {
    return { found: true, statuses: [], expirationDate: null, deletionDate: null, error: `HTTP ${res.status}` };
  }

  let body;
  try {
    body = await res.json();
  } catch (err) {
    return { found: true, statuses: [], expirationDate: null, deletionDate: null, error: `bad JSON: ${err}` };
  }

  const statuses = (body.status || []).map((s) => s.toLowerCase());
  let expirationDate = null;
  let deletionDate = null;
  for (const ev of body.events || []) {
    if (ev.eventAction === 'expiration') expirationDate = ev.eventDate;
    if (ev.eventAction === 'deletion') deletionDate = ev.eventDate;
  }
  return { found: true, statuses, expirationDate, deletionDate, raw: body };
}

/** Map raw RDAP/EPP statuses onto our lifecycle phases. */
export function phaseFromRdap(result) {
  if (!result.found) return 'droppable';
  if (result.error) return null; // inconclusive — keep previous phase
  const s = result.statuses;
  if (s.some((x) => x.includes('pending delete'))) return 'pendingDelete';
  if (s.some((x) => x.includes('redemption'))) return 'redemptionPeriod';
  if (s.some((x) => x.includes('pending restore'))) return 'pendingRestore';
  if (s.some((x) => x.includes('auto renew') || x.includes('autorenew'))) return 'graceOrAutoRenew';
  return 'active';
}
