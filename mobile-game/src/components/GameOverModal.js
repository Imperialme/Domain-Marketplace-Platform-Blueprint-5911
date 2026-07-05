import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';
import { formatScore } from '../utils/gameLogic';

const DIFF_COLORS = { easy: COLORS.accentGreen, medium: COLORS.primary, hard: COLORS.accentRed };

export default function GameOverModal({ score, rank, missed, difficulty, onReplay, onHome, onLeaderboard }) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const diffColor = DIFF_COLORS[difficulty];

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#141929', '#0d1526']}
            style={styles.cardInner}
          >
            {/* Rank badge */}
            <View style={[styles.rankBadge, { borderColor: rank.color, backgroundColor: `${rank.color}15` }]}>
              <Text style={styles.rankEmoji}>{rank.emoji}</Text>
              <Text style={[styles.rankTitle, { color: rank.color }]}>{rank.title}</Text>
            </View>

            <Text style={styles.gameOverText}>GAME OVER</Text>

            {/* Score */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>FINAL SCORE</Text>
              <Text style={[styles.scoreValue, { color: rank.color }]}>{formatScore(score)}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatItem label="Difficulty" value={difficulty.toUpperCase()} color={diffColor} />
              <StatItem label="Missed" value={String(missed)} color={missed > 5 ? COLORS.accentRed : COLORS.textMuted} />
            </View>

            {/* Motivational message */}
            <Text style={styles.message}>{getMotivation(score)}</Text>

            {/* Actions */}
            <TouchableOpacity style={styles.replayBtn} onPress={onReplay} activeOpacity={0.85}>
              <LinearGradient colors={['#4f8ef7', '#2d6de0']} style={styles.replayBtnInner}>
                <Text style={styles.replayBtnText}>🔄 Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={onLeaderboard} activeOpacity={0.7}>
                <Text style={styles.secondaryBtnText}>🏆 Scores</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={onHome} activeOpacity={0.7}>
                <Text style={styles.secondaryBtnText}>🏠 Home</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function StatItem({ label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function getMotivation(score) {
  if (score >= 5000) return "You're a Domain Mogul! Incredible! 🔥";
  if (score >= 3000) return "Outstanding performance! 💎";
  if (score >= 1500) return "Great work! You're getting better! 🚀";
  if (score >= 700) return "Not bad! Keep sniping! ⭐";
  if (score >= 200) return "Good start! Try combos for more points! 💪";
  return "Keep practicing — you've got this! 🌱";
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: { width: '100%', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  cardInner: { padding: 28, alignItems: 'center' },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 50, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 20,
  },
  rankEmoji: { fontSize: 28 },
  rankTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  gameOverText: { fontSize: 13, color: COLORS.textMuted, letterSpacing: 4, fontWeight: '700', marginBottom: 20 },
  scoreContainer: { alignItems: 'center', marginBottom: 24 },
  scoreLabel: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 2, fontWeight: '700' },
  scoreValue: { fontSize: 56, fontWeight: '900', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  statItem: { alignItems: 'center', minWidth: 80 },
  statLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 2, fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  message: { fontSize: 14, color: COLORS.textDim, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  replayBtn: { width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  replayBtnInner: { paddingVertical: 16, alignItems: 'center' },
  replayBtnText: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  secondaryRow: { flexDirection: 'row', gap: 12, width: '100%' },
  secondaryBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textDim },
});
