import { log } from '../log.js';

/**
 * GoDaddy API adapter (https://developer.godaddy.com/doc/endpoint/domains).
 * Availability checks work with just an API key pair. Purchasing additionally
 * requires registrant contact details + agreement keys, configured under
 * godaddy.contact in config.json (see README).
 */
export class GoDaddyRegistrar {
  constructor(cfg) {
    if (!cfg?.apiKey || !cfg?.apiSecret) {
      throw new Error('GoDaddy API key/secret missing (set GODADDY_API_KEY / GODADDY_API_SECRET)');
    }
    this.cfg = cfg;
    this.baseUrl = cfg.baseUrl || 'https://api.godaddy.com';
    this.headers = {
      Authorization: `sso-key ${cfg.apiKey}:${cfg.apiSecret}`,
      'Content-Type': 'application/json',
    };
  }

  async checkAvailability(domain) {
    const res = await fetch(
      `${this.baseUrl}/v1/domains/available?domain=${encodeURIComponent(domain)}&checkType=FULL`,
      { headers: this.headers, signal: AbortSignal.timeout(30000) }
    );
    if (res.status === 429) throw new Error('GoDaddy rate limit hit');
    if (!res.ok) throw new Error(`GoDaddy availability HTTP ${res.status}`);
    const body = await res.json();
    return {
      available: !!body.available,
      // GoDaddy returns price in micro-units (1/1,000,000 of currency).
      price: body.price != null ? body.price / 1_000_000 : null,
    };
  }

  async register(domain, years = 1) {
    const contact = this.cfg.contact;
    if (!contact) {
      return {
        success: false,
        message: 'GoDaddy purchase requires godaddy.contact in config.json (registrant details + agreement consent). See README.',
      };
    }
    log.catch(`GoDaddy: attempting registration of ${domain} (${years}y)`);
    const res = await fetch(`${this.baseUrl}/v1/domains/purchase`, {
      method: 'POST',
      headers: this.headers,
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        domain,
        period: years,
        renewAuto: true,
        privacy: !!this.cfg.privacy,
        consent: {
          agreementKeys: this.cfg.agreementKeys || ['DNRA'],
          agreedBy: contact.email,
          agreedAt: new Date().toISOString(),
        },
        contactAdmin: contact,
        contactBilling: contact,
        contactRegistrant: contact,
        contactTech: contact,
      }),
    });
    const body = await res.json().catch(() => ({}));
    return {
      success: res.ok,
      message: res.ok ? `order ${body.orderId ?? '?'}` : `${res.status}: ${body.message || JSON.stringify(body).slice(0, 300)}`,
    };
  }
}
