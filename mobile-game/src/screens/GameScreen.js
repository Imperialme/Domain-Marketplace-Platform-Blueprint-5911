import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableWithoutFeedback, Dimensions,
  Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, DIFFICULTY_SETTINGS, GAME_DURATION, COMBO_TIMEOUT, MAX_COMBO } from '../utils/constants';
import {
  spawnDomain, calculateScore, isComboActive, getRank, formatScore,
} from '../utils/gameLogic';
import { saveScore, incrementDomainsSnipped } from '../utils/storage';
import DomainBubble from '../components/DomainBubble';
import HUD from '../components/HUD';
import GameOverModal from '../components/GameOverModal';
import ComboPopup from '../components/ComboPopup';

const { width, height } = Dimensions.get('window');

export default function GameScreen({ navigation, route }) {
  const difficulty = route.params?.difficulty || 'medium';
  const settings = DIFFICULTY_SETTINGS[difficulty];

  const [domains, setDomains] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [comboPopups, setComboPopups] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);
  const [missed, setMissed] = useState(0);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const lastTapRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const cleanupTimerRef = useRef(null);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, []);

  const startGame = useCallback(() => {
    setStarted(true);
    setDomains([]);
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setMissed(0);
    scoreRef.current = 0;
    comboRef.current = 0;

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnTimerRef.current = setInterval(() => {
      setDomains((prev) => {
        if (prev.length >= settings.maxBubbles) return prev;
        const newDomain = spawnDomain(width, height);
        const lifetime = settings.minLifetime + Math.random() * (settings.maxLifetime - settings.minLifetime);
        const expireAt = Date.now() + lifetime;
        return [...prev, { ...newDomain, expireAt, lifetime }];
      });
    }, settings.spawnInterval);

    cleanupTimerRef.current = setInterval(() => {
      const now = Date.now();
      setDomains((prev) => {
        const expired = prev.filter((d) => now >= d.expireAt);
        if (expired.length > 0) setMissed((m) => m + expired.length);
        return prev.filter((d) => now < d.expireAt);
      });
    }, 200);
  }, [difficulty, settings]);

  const endGame = useCallback(() => {
    clearInterval(gameTimerRef.current);
    clearInterval(spawnTimerRef.current);
    clearInterval(cleanupTimerRef.current);
    setDomains([]);
    setGameOver(true);
    saveScore(scoreRef.current, difficulty);
  }, [difficulty]);

  useEffect(() => {
    startGame();
    return () => {
      clearInterval(gameTimerRef.current);
      clearInterval(spawnTimerRef.current);
      clearInterval(cleanupTimerRef.current);
    };
  }, []);

  const handleTap = useCallback((domain) => {
    triggerHaptic();
    const now = Date.now();
    const wasComboActive = isComboActive(lastTapRef.current);
    lastTapRef.current = now;

    const newCombo = wasComboActive ? Math.min(comboRef.current + 1, MAX_COMBO) : 1;
    comboRef.current = newCombo;
    setCombo(newCombo);

    const points = calculateScore(domain.extension, newCombo, difficulty);
    scoreRef.current += points;
    setScore(scoreRef.current);
    incrementDomainsSnipped();

    setDomains((prev) => prev.filter((d) => d.id !== domain.id));

    const popupId = `${now}-${Math.random()}`;
    setScorePopups((prev) => [...prev, { id: popupId, points, x: domain.x, y: domain.y, color: domain.extension.color }]);
    setTimeout(() => setScorePopups((prev) => prev.filter((p) => p.id !== popupId)), 800);

    if (newCombo >= 3) {
      const cid = `combo-${popupId}`;
      setComboPopups((prev) => [...prev, { id: cid, combo: newCombo, x: domain.x, y: domain.y }]);
      setTimeout(() => setComboPopups((prev) => prev.filter((p) => p.id !== cid)), 900);
    }
  }, [difficulty]);

  const rank = getRank(score);

  if (!started) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HUD
          score={score}
          timeLeft={timeLeft}
          combo={combo}
          difficulty={difficulty}
          onPause={endGame}
        />
      </SafeAreaView>

      {/* Game area */}
      <View style={styles.gameArea} pointerEvents="box-none">
        {domains.map((domain) => (
          <DomainBubble
            key={domain.id}
            domain={domain}
            onTap={handleTap}
          />
        ))}

        {/* Score popups */}
        {scorePopups.map((popup) => (
          <ScorePopup key={popup.id} popup={popup} />
        ))}

        {/* Combo popups */}
        {comboPopups.map((popup) => (
          <ComboPopup key={popup.id} popup={popup} />
        ))}
      </View>

      {/* Game over modal */}
      {gameOver && (
        <GameOverModal
          score={score}
          rank={rank}
          missed={missed}
          difficulty={difficulty}
          onReplay={() => {
            setGameOver(false);
            startGame();
          }}
          onHome={() => navigation.navigate('Home')}
          onLeaderboard={() => navigation.navigate('Leaderboard')}
        />
      )}
    </View>
  );
}

function ScorePopup({ popup }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 6 }),
      Animated.timing(anim, { toValue: 2, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -20, -50] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1, 2], outputRange: [0, 1, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.5, 1.2, 1] });

  return (
    <Animated.Text
      style={[
        styles.scorePopup,
        { color: popup.color, left: popup.x - 30, top: popup.y - 40,
          transform: [{ translateY }, { scale }], opacity },
      ]}
    >
      +{popup.points}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { zIndex: 10 },
  gameArea: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  scorePopup: {
    position: 'absolute', fontSize: 22, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
    zIndex: 20, pointerEvents: 'none',
  },
});
