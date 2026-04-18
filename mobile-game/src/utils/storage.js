import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY_SCORES, STORAGE_KEY_BEST, STORAGE_KEY_STATS } from './constants';

export async function saveScore(score, difficulty) {
  try {
    const existing = await getScores();
    const entry = { score, difficulty, date: new Date().toISOString() };
    const updated = [entry, ...existing].slice(0, 20);
    await AsyncStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(updated));

    const best = await getBestScore();
    if (score > best) {
      await AsyncStorage.setItem(STORAGE_KEY_BEST, String(score));
    }

    await incrementStat('gamesPlayed');
    await addToStat('totalScore', score);
  } catch (_) {}
}

export async function getScores() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_SCORES);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function getBestScore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_BEST);
    return raw ? parseInt(raw, 10) : 0;
  } catch (_) {
    return 0;
  }
}

export async function getStats() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_STATS);
    return raw ? JSON.parse(raw) : { gamesPlayed: 0, totalScore: 0, domainsSnipped: 0 };
  } catch (_) {
    return { gamesPlayed: 0, totalScore: 0, domainsSnipped: 0 };
  }
}

async function incrementStat(key) {
  const stats = await getStats();
  stats[key] = (stats[key] || 0) + 1;
  await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
}

export async function addToStat(key, value) {
  const stats = await getStats();
  stats[key] = (stats[key] || 0) + value;
  await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
}

export async function incrementDomainsSnipped() {
  await incrementStat('domainsSnipped');
}
