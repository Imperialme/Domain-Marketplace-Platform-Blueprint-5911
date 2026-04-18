import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function ComboPopup({ popup }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, tension: 180, friction: 5, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(anim, { toValue: 2, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.3, 1.3, 0.8] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1, 2], outputRange: [0, 1, 1, 0] });
  const translateY = anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -30, -55] });

  const color = popup.combo >= 8 ? COLORS.accentRed
    : popup.combo >= 5 ? COLORS.accentPurple
    : popup.combo >= 3 ? COLORS.accent
    : COLORS.accentGreen;

  const label = popup.combo >= 8 ? '🔥 INSANE!'
    : popup.combo >= 5 ? '⚡ EPIC!'
    : popup.combo >= 3 ? '✨ COMBO!'
    : `x${popup.combo}`;

  return (
    <Animated.Text
      style={[
        styles.popup,
        { color, left: popup.x - 50, top: popup.y - 70,
          transform: [{ scale }, { translateY }], opacity },
      ]}
    >
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute', fontSize: 18, fontWeight: '900', letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6,
    zIndex: 25, width: 100, textAlign: 'center', pointerEvents: 'none',
  },
});
