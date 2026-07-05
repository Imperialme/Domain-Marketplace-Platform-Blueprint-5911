// Country code → purchasing power tier
// 4 = Premium  (US, UK, UAE, Germany, Singapore …)
// 3 = High     (Saudi, Italy, Spain, Taiwan, HK …)
// 2 = Mid      (Brazil, Mexico, Turkey, Russia, S. Africa …)
// 1 = Standard (India, Pakistan, Nigeria, Indonesia …)
const TIERS = {
  // ── Tier 4: Premium ──────────────────────────────────────────
  US: 4, GB: 4, CA: 4, AU: 4, NZ: 4,
  DE: 4, CH: 4, AT: 4, LU: 4, LI: 4,
  NO: 4, SE: 4, DK: 4, FI: 4, IS: 4,
  NL: 4, BE: 4, FR: 4, IE: 4,
  JP: 4, SG: 4, KR: 4, HK: 4, TW: 4,
  IL: 4, AE: 4, QA: 4, KW: 4, BH: 4,
  // ── Tier 3: High ─────────────────────────────────────────────
  SA: 3, OM: 3, JO: 3,
  IT: 3, ES: 3, PT: 3, GR: 3, CY: 3, MT: 3,
  CZ: 3, SK: 3, PL: 3, HU: 3, SI: 3, HR: 3, EE: 3, LV: 3, LT: 3,
  CN: 3, MY: 3, TH: 3, BR: 3, CL: 3, UY: 3, PA: 3, CR: 3,
  ZA: 3, MU: 3,
  // ── Tier 2: Mid ──────────────────────────────────────────────
  TR: 2, RU: 2, MX: 2, AR: 2, CO: 2, PE: 2, EC: 2,
  RO: 2, BG: 2, RS: 2, UA: 2, MK: 2, BA: 2, AL: 2,
  EG: 2, TN: 2, MA: 2, DZ: 2, LY: 2,
  ID: 2, VN: 2, PH: 2, LK: 2,
  GH: 2, KE: 2, CI: 2, SN: 2, CM: 2, TZ: 2,
  // ── Tier 1: Standard ─────────────────────────────────────────
  IN: 1, PK: 1, BD: 1, NP: 1, MM: 1, KH: 1, LA: 1,
  NG: 1, ET: 1, UG: 1, MZ: 1, ZM: 1, ZW: 1, SD: 1, ML: 1, BF: 1,
  AF: 1, IQ: 1, YE: 1, SY: 1,
};

const TIER_META = {
  4: {
    label: 'Premium Buyer',
    hint: 'High budget market — don\'t discount',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    dot: 'bg-emerald-500',
    stars: '⭐⭐⭐⭐',
  },
  3: {
    label: 'Strong Buyer',
    hint: 'Good purchasing power',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    dot: 'bg-blue-500',
    stars: '⭐⭐⭐',
  },
  2: {
    label: 'Mid-Market',
    hint: 'May negotiate, flexible on price',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    dot: 'bg-amber-500',
    stars: '⭐⭐',
  },
  1: {
    label: 'Budget Buyer',
    hint: 'Price-sensitive — value message matters',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    dot: 'bg-orange-500',
    stars: '⭐',
  },
};

export const getPurchasingPower = (countryCode) => {
  const tier = TIERS[countryCode] ?? 2;
  return { tier, ...TIER_META[tier] };
};

// Convert ISO 3166-1 alpha-2 → emoji flag  (e.g. "US" → 🇺🇸)
export const countryFlag = (code) => {
  if (!code || code.length !== 2) return '🌍';
  const offset = 0x1f1e0 - 0x41;
  return String.fromCodePoint(
    code.toUpperCase().charCodeAt(0) + offset,
    code.toUpperCase().charCodeAt(1) + offset,
  );
};

// Fetch geo data: tries Netlify edge function first, falls back to ipapi.co
export const fetchGeoData = async () => {
  // 1 — Netlify edge function (free, built-in, most accurate)
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch('/api/geo', { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.country) return { source: 'netlify', ...data };
    }
  } catch {
    // not on Netlify or timed out — fall through
  }

  // 2 — ipapi.co fallback (free, 30k req/month, no key)
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const d = await res.json();
      if (d.error) return {};
      return {
        source: 'ipapi',
        ip: d.ip,
        country: d.country_code,
        countryName: d.country_name,
        city: d.city,
        region: d.region,
        latitude: d.latitude,
        longitude: d.longitude,
        timezone: d.timezone,
        currency: d.currency,
        isp: d.org,
      };
    }
  } catch {
    // offline or blocked
  }

  return {};
};
