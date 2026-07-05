import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DIFFICULTY_SETTINGS } from '../utils/constants';
import { getBestScore } from '../utils/storage';
import { formatScore } from '../utils/gameLogic';

const { width } = Dimensions.get('window');

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function HomeScreen({ navigation }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [bestScore, setBestScore] = useState(0);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getBestScore().then(setBestScore);

    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const titleStyle = {
    opacity: titleAnim,
    transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
  };

  return (
    <LinearGradient colors={['#0a0e1a', '#0d1526', '#0a0e1a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <Animated.View style={[styles.header, titleStyle]}>
          <Animated.Text style={[styles.emoji, { transform: [{ translateY: floatAnim }] }]}>
            🎯
          </Animated.Text>
          <Text style={styles.title}>Domain Sniper</Text>
          <Text style={styles.subtitle}>Snipe domains before they expire!</Text>
        </Animated.View>

        {/* Best Score */}
        {bestScore > 0 && (
          <View style={styles.bestScore}>
            <Text style={styles.bestLabel}>BEST SCORE</Text>
            <Text style={styles.bestValue}>{formatScore(bestScore)}</Text>
          </View>
        )}

        {/* Difficulty selector */}
        <View style={styles.difficultyContainer}>
          <Text style={styles.sectionLabel}>SELECT DIFFICULTY</Text>
          <View style={styles.difficultyRow}>
            {DIFFICULTIES.map((d) => {
              const active = d === difficulty;
              const cfg = { easy: { color: COLORS.accentGreen, label: '🟢 Easy' },
                            medium: { color: COLORS.primary, label: '🔵 Medium' },
                            hard: { color: COLORS.accentRed, label: '🔴 Hard' } }[d];
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.diffBtn, active && { borderColor: cfg.color, backgroundColor: `${cfg.color}20` }]}
                  onPress={() => setDifficulty(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.diffBtnText, active && { color: cfg.color }]}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Play button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => navigation.navigate('Game', { difficulty })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#4f8ef7', '#2d6de0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playBtnInner}
            >
              <Text style={styles.playBtnText}>PLAY NOW</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnIcon}>🏆</Text>
            <Text style={styles.navBtnText}>Scores</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.navigate('HowToPlay')}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnIcon}>❓</Text>
            <Text style={styles.navBtnText}>How To</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>v1.0.0</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 36, fontWeight: '900', color: COLORS.text, letterSpacing: 2, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, letterSpacing: 1 },
  bestScore: {
    backgroundColor: `${COLORS.accent}15`, borderWidth: 1, borderColor: `${COLORS.accent}40`,
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginBottom: 28, alignItems: 'center',
  },
  bestLabel: { fontSize: 10, color: COLORS.accent, letterSpacing: 2, fontWeight: '700' },
  bestValue: { fontSize: 28, color: COLORS.accent, fontWeight: '900', marginTop: 2 },
  difficultyContainer: { width: '100%', marginBottom: 32 },
  sectionLabel: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 2, marginBottom: 10, textAlign: 'center' },
  difficultyRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  diffBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5,
    borderColor: COLORS.border, alignItems: 'center',
  },
  diffBtnText: { fontSize: 13, color: COLORS.textDim, fontWeight: '600' },
  playBtn: { width: width * 0.7, borderRadius: 20, overflow: 'hidden', marginBottom: 32,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16,
    elevation: 10 },
  playBtnInner: { paddingVertical: 18, alignItems: 'center' },
  playBtnText: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  navRow: { flexDirection: 'row', gap: 16 },
  navBtn: {
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  navBtnIcon: { fontSize: 22 },
  navBtnText: { fontSize: 12, color: COLORS.textDim, marginTop: 4, fontWeight: '600' },
  version: { position: 'absolute', bottom: 16, color: COLORS.textMuted, fontSize: 11 },
});
