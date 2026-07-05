import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const CONFIG_PATH = process.env.DROPCATCHER_CONFIG || path.join(ROOT, 'config.json');

/** Resolve "env:VAR_NAME" placeholders so secrets never live in the config file. */
function resolveEnvRefs(value) {
  if (typeof value === 'string' && value.startsWith('env:')) {
    return process.env[value.slice(4)] || '';
  }
  if (Array.isArray(value)) return value.map(resolveEnvRefs);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveEnvRefs(v)]));
  }
  return value;
}

export function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      `Config not found at ${CONFIG_PATH}. Run "node src/cli.js init" to create one from the example.`
    );
  }
  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const cfg = resolveEnvRefs(raw);

  cfg.defaults = {
    maxPrice: 50,
    registrationYears: 1,
    dropWindowUtc: { start: '00:00', end: '23:59' },
    ...cfg.defaults,
  };
  cfg.monitor = { intervalMinutes: 60, ...cfg.monitor };
  cfg.catch = { pollMs: 1500, registerRetries: 8, maxBurstHours: 12, ...cfg.catch };
  cfg.watchlist = (cfg.watchlist || []).map((entry) =>
    typeof entry === 'string' ? { domain: entry } : entry
  );
  for (const entry of cfg.watchlist) {
    entry.domain = entry.domain.toLowerCase().trim();
    entry.maxPrice = entry.maxPrice ?? cfg.defaults.maxPrice;
    entry.registrationYears = entry.registrationYears ?? cfg.defaults.registrationYears;
    entry.dropWindowUtc = entry.dropWindowUtc ?? cfg.defaults.dropWindowUtc;
  }
  return cfg;
}

export function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + '\n');
}
