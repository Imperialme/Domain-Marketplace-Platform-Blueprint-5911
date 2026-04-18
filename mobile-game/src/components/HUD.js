import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, GAME_DURATION } from '../utils/constants';
import { formatScore } from '../utils/gameLogic';

const DIFF_COLORS = { easy: COLORS.accentGreen, medium: COLORS.primary, hard: COLORS.accentRed };

export default function HUD({ score, timeLeft, combo, difficulty, onPause }) {
  const scoreAnim = useRef(new Animated.Value(1)).current;
  const timeAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef(score);

  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score;
      Animated.sequence([
        Animated.spring(scoreAnim, { toValue: 1.2, useNativeDriver: true, tension: 200, friction: 5 }),
        Animated.spring(scoreAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
      ]).start();
    }
  }, [score]);

  useEffect(() => {
    if (timeLeft <= 10) {
      Animated.sequence([
        Animated.timing(timeAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(timeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [timeLeft]);

  const timePercent = timeLeft / GAME_DURATION;
  const timeColor = timeLeft <= 10 ? COLORS.accentRed : timeLeft <= 20 ? COLORS.accent : COLORS.accentGreen;
  const diffColor = DIFF_COLORS[difficulty];

  return (
    <View style={styles.hud}>
      {/* Top row */}
      <View style={styles.topRow}>
        {/* Score */}
        <View style={styles.scoreBlock}>
          <Text style={styles.label}>SCORE</Text>
          <Animated.Text style={[styles.scoreValue, { transform: [{ scale: scoreAnim }] }]}>
            {formatScore(score)}
          </Animated.Text>
        </View>

        {/* Timer */}
        <View style={styles.timerBlock}>
          <Animated.Text style={[styles.timerValue, { color: timeColor, transform: [{ scale: timeAnim }] }]}>
            {timeLeft}
          </Animated.Text>
          <View style={styles.timerBar}>
            <Animated.View style={[styles.timerFill, { width: `${timePercent * 100}%`, backgroundColor: timeColor }]} />
          </View>
        </View>

        {/* Combo + Difficulty */}
        <View style={styles.rightBlock}>
          <TouchableOpacity onPress={onPause} style={styles.pauseBtn}>
            <Text style={styles.pauseIcon}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.diffBadge, { borderColor: diffColor }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{difficulty.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Combo bar */}
      {combo >= 2 && (
        <View style={styles.comboBar}>
          <Text style={styles.comboLabel}>COMBO</Text>
          <Text style={styles.comboValue}>x{combo}</Text>
          <View style={styles.comboDots}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[styles.comboDot, i < combo && { backgroundColor: COLORS.accent }]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8,
    backgroundColor: `${COLORS.background}ee`,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreBlock: { minWidth: 80 },
  label: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 2, fontWeight: '700' },
  scoreValue: { fontSize: 26, fontWeight: '900', color: COLORS.text },
  timerBlock: { alignItems: 'center' },
  timerValue: { fontSize: 32, fontWeight: '900' },
  timerBar: {
    width: 80, height: 4, backgroundColor: COLORS.surfaceLight,
    borderRadius: 2, overflow: 'hidden', marginTop: 2,
  },
  timerFill: { height: '100%', borderRadius: 2 },
  rightBlock: { minWidth: 80, alignItems: 'flex-end', gap: 6 },
  pauseBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.surfaceLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  pauseIcon: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  diffBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  diffText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  comboBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 6,
  },
  comboLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 2, fontWeight: '700', width: 44 },
  comboValue: { fontSize: 18, fontWeight: '900', color: COLORS.accent, width: 36 },
  comboDots: { flexDirection: 'row', gap: 4, flex: 1 },
  comboDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border,
  },
});
