import React, { useEffect, useRef, memo } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../utils/constants';

const DomainBubble = memo(({ domain, onTap }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pop in
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 120,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.97, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Lifetime countdown (opacity fades toward end)
    const fadeDuration = Math.max(domain.lifetime * 0.3, 400);
    Animated.sequence([
      Animated.delay(domain.lifetime - fadeDuration),
      Animated.timing(opacityAnim, { toValue: 0.2, duration: fadeDuration, useNativeDriver: true }),
    ]).start();

    // Timer ring fill
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: domain.lifetime,
      useNativeDriver: false,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.4,
      tension: 200,
      friction: 4,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    onTap(domain);
  };

  const color = domain.extension.color;
  const size = domain.size;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          left: domain.x - size / 2,
          top: domain.y - size / 2,
          width: size,
          height: size,
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}
      >
        {/* Glow background */}
        <View style={[styles.glow, { backgroundColor: `${color}15`, borderRadius: size / 2 }]} />

        {/* Timer ring overlay using border trick */}
        <Animated.View
          style={[
            styles.timerRing,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
              borderColor: color,
              borderWidth: timerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }),
            },
          ]}
        />

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.domainName, { color: '#fff' }]} numberOfLines={1}>
            {domain.name}
          </Text>
          <Text style={[styles.extension, { color }]}>{domain.extension.ext}</Text>
          <Text style={[styles.points, { color: `${color}cc` }]}>
            +{domain.extension.points}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default DomainBubble;

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', zIndex: 5 },
  bubble: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: `${COLORS.surface}ee`,
    borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
    overflow: 'hidden',
  },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  timerRing: { position: 'absolute', top: 2, left: 2 },
  content: { alignItems: 'center', paddingHorizontal: 4 },
  domainName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  extension: { fontSize: 16, fontWeight: '900', letterSpacing: 1, marginTop: 1 },
  points: { fontSize: 11, fontWeight: '600', marginTop: 1 },
});
