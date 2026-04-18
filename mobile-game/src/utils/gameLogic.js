import { DOMAIN_EXTENSIONS, DOMAIN_NAMES, DIFFICULTY_SETTINGS, COMBO_TIMEOUT } from './constants';

export function getRandomDomainExtension() {
  const rand = Math.random();
  let cumulative = 0;
  for (const ext of DOMAIN_EXTENSIONS) {
    cumulative += ext.spawnRate;
    if (rand <= cumulative) return ext;
  }
  return DOMAIN_EXTENSIONS[DOMAIN_EXTENSIONS.length - 1];
}

export function getRandomDomainName() {
  return DOMAIN_NAMES[Math.floor(Math.random() * DOMAIN_NAMES.length)];
}

export function spawnDomain(screenWidth, screenHeight) {
  const ext = getRandomDomainExtension();
  const name = getRandomDomainName();
  const bubbleSize = 70 + Math.random() * 30;
  const margin = bubbleSize / 2 + 10;

  return {
    id: `${Date.now()}-${Math.random()}`,
    name,
    extension: ext,
    x: margin + Math.random() * (screenWidth - margin * 2),
    y: margin + Math.random() * (screenHeight * 0.65 - margin * 2) + screenHeight * 0.1,
    size: bubbleSize,
    createdAt: Date.now(),
  };
}

export function calculateScore(extension, combo, difficulty) {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const comboBonus = 1 + combo * 0.15;
  return Math.round(extension.points * comboBonus * settings.bonusMultiplier);
}

export function isComboActive(lastTapTime) {
  return Date.now() - lastTapTime < COMBO_TIMEOUT;
}

export function getRank(score) {
  if (score >= 5000) return { title: 'Domain Mogul',    emoji: '👑', color: '#f7c948' };
  if (score >= 3000) return { title: 'Domain Baron',    emoji: '💎', color: '#a855f7' };
  if (score >= 1500) return { title: 'Domain Expert',   emoji: '🚀', color: '#4f8ef7' };
  if (score >= 700)  return { title: 'Domain Trader',   emoji: '⭐', color: '#3dd68c' };
  if (score >= 200)  return { title: 'Domain Hunter',   emoji: '🎯', color: '#f79a4f' };
  return               { title: 'Domain Novice',   emoji: '🌱', color: '#94a3b8' };
}

export function formatScore(score) {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(score);
}
