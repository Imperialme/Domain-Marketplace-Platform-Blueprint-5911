import { log } from './log.js';
import { notify } from './notify.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Is the current UTC time inside the entry's HH:MM–HH:MM drop window? */
export function inDropWindow(entry, now = new Date()) {
  const { start, end } = entry.dropWindowUtc || { start: '00:00', end: '23:59' };
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const toMin = (s) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const startM = toMin(start);
  const endM = toMin(end);
  // Windows that cross midnight (e.g. 22:00–04:00) are supported.
  return startM <= endM ? minutes >= startM && minutes <= endM : minutes >= startM || minutes <= endM;
}

/**
 * Try to register the domain right now, with retries. Registries briefly
 * report "available" to search before registration goes through, and the
 * first register attempt can race other catchers — so we retry a few times.
 */
export async function attemptRegistration(registrar, cfg, entry) {
  const retries = cfg.catch.registerRetries;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { available, price } = await registrar.checkAvailability(entry.domain);
      if (!available) {
        log.info(`${entry.domain}: registrar says not available (attempt ${attempt}/${retries})`);
        await sleep(cfg.catch.pollMs);
        continue;
      }
      if (price != null && price > entry.maxPrice) {
        await notify(cfg, `price cap hit: ${entry.domain}`,
          `Available at ${price} but your maxPrice is ${entry.maxPrice}. Skipping — raise maxPrice in config to catch it (premium drops often carry premium registry pricing).`);
        return { success: false, reason: 'over-max-price', price };
      }
      const result = await registrar.register(entry.domain, entry.registrationYears);
      if (result.success) {
        await notify(cfg, `✅ CAUGHT ${entry.domain}`,
          `Registered for ${entry.registrationYears} year(s)${price != null ? ` at ~${price}` : ''}. (${result.message})`);
        return { success: true, price };
      }
      log.warn(`${entry.domain}: register attempt ${attempt}/${retries} failed: ${result.message}`);
    } catch (err) {
      log.warn(`${entry.domain}: attempt ${attempt}/${retries} errored: ${err.message || err}`);
    }
    await sleep(cfg.catch.pollMs);
  }
  return { success: false, reason: 'retries-exhausted' };
}

/**
 * Burst mode: sit in a tight sequential loop against the registrar's
 * availability endpoint and register the moment the domain frees up.
 * Sequential by design — Dynadot only processes one request per key at a
 * time, and hammering in parallel just gets your key throttled.
 */
export async function burstCatch(registrar, cfg, entry, { ignoreWindow = false, shouldStop = () => false } = {}) {
  const deadline = Date.now() + cfg.catch.maxBurstHours * 3600_000;
  log.catch(`burst mode for ${entry.domain}: polling every ${cfg.catch.pollMs}ms, up to ${cfg.catch.maxBurstHours}h`);
  await notify(cfg, `burst started: ${entry.domain}`,
    `Polling registrar every ${cfg.catch.pollMs}ms until caught, window closes, or ${cfg.catch.maxBurstHours}h elapse.`);

  let consecutiveErrors = 0;
  while (Date.now() < deadline) {
    if (shouldStop()) return { success: false, reason: 'stopped' };
    if (!ignoreWindow && !inDropWindow(entry)) {
      log.info(`${entry.domain}: outside drop window ${entry.dropWindowUtc.start}–${entry.dropWindowUtc.end} UTC, pausing burst`);
      return { success: false, reason: 'window-closed' };
    }
    try {
      const { available, price } = await registrar.checkAvailability(entry.domain);
      consecutiveErrors = 0;
      if (available) {
        log.catch(`${entry.domain} IS AVAILABLE — registering now`);
        const result = await attemptRegistration(registrar, cfg, entry);
        if (result.success || result.reason === 'over-max-price') return result;
        // Registration lost the race but the drop is live — keep bursting.
      }
      if (price != null && price > entry.maxPrice && available) {
        return { success: false, reason: 'over-max-price', price };
      }
    } catch (err) {
      consecutiveErrors++;
      // Exponential backoff on repeated API errors so we don't get banned.
      const backoff = Math.min(cfg.catch.pollMs * 2 ** consecutiveErrors, 60_000);
      log.warn(`${entry.domain}: availability check failed (${err.message || err}); backing off ${backoff}ms`);
      await sleep(backoff);
      continue;
    }
    await sleep(cfg.catch.pollMs);
  }
  await notify(cfg, `burst timed out: ${entry.domain}`, `No catch after ${cfg.catch.maxBurstHours}h.`);
  return { success: false, reason: 'timeout' };
}
