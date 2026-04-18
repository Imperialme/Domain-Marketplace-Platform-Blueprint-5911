export const COLORS = {
  background: '#0a0e1a',
  surface: '#141929',
  surfaceLight: '#1e2640',
  primary: '#4f8ef7',
  primaryDark: '#2d6de0',
  accent: '#f7c948',
  accentGreen: '#3dd68c',
  accentRed: '#f75a5a',
  accentPurple: '#a855f7',
  text: '#e2e8f0',
  textMuted: '#64748b',
  textDim: '#94a3b8',
  border: '#2d3748',
  neon: '#00f5d4',
};

export const DOMAIN_EXTENSIONS = [
  { ext: '.com',   points: 100, color: '#f7c948', rarity: 'legendary', spawnRate: 0.10 },
  { ext: '.io',    points: 80,  color: '#a855f7', rarity: 'epic',      spawnRate: 0.12 },
  { ext: '.ai',    points: 75,  color: '#4f8ef7', rarity: 'epic',      spawnRate: 0.13 },
  { ext: '.dev',   points: 60,  color: '#3dd68c', rarity: 'rare',      spawnRate: 0.15 },
  { ext: '.co',    points: 50,  color: '#00f5d4', rarity: 'rare',      spawnRate: 0.15 },
  { ext: '.net',   points: 35,  color: '#f79a4f', rarity: 'uncommon',  spawnRate: 0.17 },
  { ext: '.org',   points: 20,  color: '#94a3b8', rarity: 'common',    spawnRate: 0.18 },
];

export const DOMAIN_NAMES = [
  'uber', 'nova', 'flux', 'apex', 'zeta', 'nexo', 'ping', 'bolt',
  'snap', 'grid', 'vega', 'sync', 'halo', 'echo', 'prism', 'core',
  'axle', 'blaze', 'drift', 'glide', 'pulse', 'realm', 'stack',
  'swift', 'wave', 'zen', 'bloom', 'cloud', 'dawn', 'edge',
  'forge', 'glow', 'hub', 'ink', 'jet', 'key', 'link',
];

export const RARITY_COLORS = {
  common:    '#94a3b8',
  uncommon:  '#3dd68c',
  rare:      '#4f8ef7',
  epic:      '#a855f7',
  legendary: '#f7c948',
};

export const DIFFICULTY_SETTINGS = {
  easy:   { spawnInterval: 1800, minLifetime: 3500, maxLifetime: 5500, maxBubbles: 6,  bonusMultiplier: 1.0 },
  medium: { spawnInterval: 1300, minLifetime: 2500, maxLifetime: 4000, maxBubbles: 8,  bonusMultiplier: 1.5 },
  hard:   { spawnInterval: 900,  minLifetime: 1800, maxLifetime: 3000, maxBubbles: 10, bonusMultiplier: 2.0 },
};

export const GAME_DURATION = 60;
export const COMBO_TIMEOUT = 2000;
export const MAX_COMBO = 10;
export const STORAGE_KEY_SCORES = '@domain_sniper_scores';
export const STORAGE_KEY_BEST = '@domain_sniper_best';
export const STORAGE_KEY_STATS = '@domain_sniper_stats';
