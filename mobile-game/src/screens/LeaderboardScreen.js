import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';
import { getScores, getBestScore, getStats } from '../utils/storage';
import { getRank, formatScore } from '../utils/gameLogic';

const DIFF_COLORS = {
  easy: COLORS.accentGreen, medium: COLORS.primary, hard: COLORS.accentRed,
};

export default function LeaderboardScreen({ navigation }) {
  const [scores, setScores] = useState([]);
  const [best, setBest] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getScores(), getBestScore(), getStats()]).then(([s, b, st]) => {
      setScores(s.sort((a, b) => b.score - a.score));
      setBest(b);
      setStats(st);
      setLoading(false);
    });
  }, []);

  const rank = getRank(best);

  const renderItem = ({ item, index }) => {
    const itemRank = getRank(item.score);
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
    const date = new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
      <View style={[styles.scoreRow, index === 0 && styles.topScore]}>
        <Text style={styles.medal}>{medal}</Text>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreValue}>{formatScore(item.score)}</Text>
          <Text style={[styles.scoreDiff, { color: DIFF_COLORS[item.difficulty] }]}>
            {item.difficulty}
          </Text>
        </View>
        <View style={styles.scoreRight}>
          <Text style={[styles.scoreRankTitle, { color: itemRank.color }]}>{itemRank.emoji}</Text>
          <Text style={styles.scoreDate}>{date}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0a0e1a', '#0d1526', '#0a0e1a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🏆 Scores</Text>
          <View style={{ width: 60 }} />
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Best score card */}
            {best > 0 && (
              <View style={styles.bestCard}>
                <LinearGradient
                  colors={[`${rank.color}30`, `${rank.color}10`]}
                  style={styles.bestGradient}
                >
                  <Text style={styles.bestEmoji}>{rank.emoji}</Text>
                  <View>
                    <Text style={styles.bestLabel}>PERSONAL BEST</Text>
                    <Text style={[styles.bestScore, { color: rank.color }]}>{formatScore(best)}</Text>
                    <Text style={[styles.bestRank, { color: rank.color }]}>{rank.title}</Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Stats */}
            {stats && (
              <View style={styles.statsRow}>
                <StatBox label="Games" value={stats.gamesPlayed} />
                <StatBox label="Sniped" value={stats.domainsSnipped} />
                <StatBox label="Total XP" value={formatScore(stats.totalScore)} />
              </View>
            )}

            {/* Score list */}
            {scores.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎯</Text>
                <Text style={styles.emptyText}>No games played yet</Text>
                <Text style={styles.emptySubtext}>Play your first game to see scores here!</Text>
                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.playBtnText}>Play Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={scores}
                keyExtractor={(_, i) => String(i)}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { padding: 4 },
  backBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  bestCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  bestGradient: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  bestEmoji: { fontSize: 44 },
  bestLabel: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 2, fontWeight: '700' },
  bestScore: { fontSize: 36, fontWeight: '900', marginVertical: 2 },
  bestRank: { fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, letterSpacing: 1 },
  list: { paddingBottom: 20 },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  topScore: { borderColor: `${COLORS.accent}60`, backgroundColor: `${COLORS.accent}08` },
  medal: { fontSize: 20, width: 36 },
  scoreInfo: { flex: 1 },
  scoreValue: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  scoreDiff: { fontSize: 12, fontWeight: '600', marginTop: 2, textTransform: 'capitalize' },
  scoreRight: { alignItems: 'flex-end' },
  scoreRankTitle: { fontSize: 20 },
  scoreDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  playBtn: {
    marginTop: 24, backgroundColor: COLORS.primary, paddingHorizontal: 32,
    paddingVertical: 14, borderRadius: 12,
  },
  playBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
