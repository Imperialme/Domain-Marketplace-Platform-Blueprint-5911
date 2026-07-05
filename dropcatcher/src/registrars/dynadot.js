import { log } from '../log.js';

/**
 * Dynadot API v3 adapter (https://www.dynadot.com/domain/api3.html).
 *
 * Dynadot processes ONE request per API key at a time — a second concurrent
 * request is rejected with "there is a request being processed". All calls
 * here go through a promise chain so they are strictly sequential, which is
 * also why the catch loop polls instead of firing in parallel.
 */
export class DynadotRegistrar {
  constructor(cfg) {
    if (!cfg?.apiKey) throw new Error('Dynadot API key missing (set DYNADOT_API_KEY)');
    this.apiKey = cfg.apiKey;
    this.currency = cfg.currency || 'USD';
    this.baseUrl = cfg.baseUrl || 'https://api.dynadot.com/api3.json';
    this._queue = Promise.resolve();
  }

  _call(params) {
    const run = async () => {
      const url = new URL(this.baseUrl);
      url.searchParams.set('key', this.apiKey);
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`Dynadot HTTP ${res.status}`);
      return res.json();
    };
    const p = this._queue.then(run, run);
    // Keep the chain alive even if this call fails.
    this._queue = p.catch(() => {});
    return p;
  }

  /** @returns {Promise<{available: boolean, price: number|null}>} */
  async checkAvailability(domain) {
    const body = await this._call({
      command: 'search',
      domain0: domain,
      show_price: 1,
      currency: this.currency,
    });
    const result = body?.SearchResponse?.SearchResults?.[0];
    if (!result) throw new Error(`Dynadot search: unexpected response ${JSON.stringify(body).slice(0, 300)}`);
    const available = String(result.Available).toLowerCase() === 'yes';
    // Price comes back like "12.99 in USD"
    const price = result.Price ? parseFloat(String(result.Price)) : null;
    return { available, price: Number.isNaN(price) ? null : price };
  }

  /** @returns {Promise<{success: boolean, message: string}>} */
  async register(domain, years = 1) {
    log.catch(`Dynadot: attempting registration of ${domain} (${years}y)`);
    const body = await this._call({
      command: 'register',
      domain,
      duration: years,
      currency: this.currency,
    });
    const resp = body?.RegisterResponse;
    const success = resp?.ResponseCode === 0 || resp?.ResponseCode === '0';
    const message = resp?.Error || resp?.Status || JSON.stringify(body).slice(0, 300);
    return { success, message };
  }
}
