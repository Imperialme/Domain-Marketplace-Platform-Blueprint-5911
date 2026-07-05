import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DOMAIN_EXTENSIONS } from '../utils/constants';
import { RARITY_COLORS } from '../utils/constants';

const STEPS = [
  { icon: '👀', title: 'Watch', desc: 'Domain bubbles appear on screen and slowly expire.' },
  { icon: '👆', title: 'Tap Fast', desc: 'Tap a domain bubble to "snipe" it before it disappears.' },
  { icon: '⚡', title: 'Combo', desc: 'Tap domains quickly in a row to build a combo multiplier for bonus points.' },
  { icon: '💰', title: 'Score', desc: 'Rarer domain extensions are worth more points. .com is the jackpot!' },
  { icon: '⏱️', title: '60 Seconds', desc: 'You have 60 seconds per game. Snipe as many as you can!' },
];

export default function HowToPlayScreen({ navigation }) {
  return (
    <LinearGradient colors={['#0a0e1a', '#0d1526', '#0a0e1a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>How To Play</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Steps */}
          <Text style={styles.sectionTitle}>GAMEPLAY</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepCard}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}

          {/* Domain values */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>DOMAIN VALUES</Text>
          {DOMAIN_EXTENSIONS.map((ext) => (
            <View key={ext.ext} style={styles.extRow}>
              <View style={[styles.extBadge, { backgroundColor: `${ext.color}20`, borderColor: `${ext.color}60` }]}>
                <Text style={[styles.extName, { color: ext.color }]}>{ext.ext}</Text>
              </View>
              <Text style={[styles.extRarity, { color: RARITY_COLORS[ext.rarity] }]}>
                {ext.rarity.toUpperCase()}
              </Text>
              <Text style={styles.extPoints}>{ext.points} pts</Text>
            </View>
          ))}

          {/* Combo info */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>COMBO SYSTEM</Text>
          <View style={styles.comboCard}>
            <Text style={styles.comboText}>
              Tap domains within <Text style={{ color: COLORS.accent }}>2 seconds</Text> of each other to chain combos.
            </Text>
            <Text style={styles.comboText}>
              Each combo level adds a <Text style={{ color: COLORS.accentGreen }}>+15% bonus</Text> to your score.
            </Text>
            <Text style={styles.comboText}>
              Maximum combo is <Text style={{ color: COLORS.accentRed }}>x10</Text> — that's +150% bonus!
            </Text>
          </View>

          {/* Ranks */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>RANKS</Text>
          {[
            { title: 'Domain Mogul', emoji: '👑', color: '#f7c948', min: '5,000+' },
            { title: 'Domain Baron', emoji: '💎', color: '#a855f7', min: '3,000+' },
            { title: 'Domain Expert', emoji: '🚀', color: '#4f8ef7', min: '1,500+' },
            { title: 'Domain Trader', emoji: '⭐', color: '#3dd68c', min: '700+' },
            { title: 'Domain Hunter', emoji: '🎯', color: '#f79a4f', min: '200+' },
            { title: 'Domain Novice', emoji: '🌱', color: '#94a3b8', min: '0+' },
          ].map((r) => (
            <View key={r.title} style={styles.rankRow}>
              <Text style={styles.rankEmoji}>{r.emoji}</Text>
              <Text style={[styles.rankTitle, { color: r.color }]}>{r.title}</Text>
              <Text style={styles.rankMin}>{r.min} pts</Text>
            </View>
          ))}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { padding: 4 },
  backBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  sectionTitle: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 2, fontWeight: '700', marginBottom: 12 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, gap: 14,
  },
  stepIcon: { fontSize: 28 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  stepDesc: { fontSize: 13, color: COLORS.textDim, marginTop: 3, lineHeight: 18 },
  extRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  extBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 12 },
  extName: { fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  extRarity: { flex: 1, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  extPoints: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  comboCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  comboText: { fontSize: 14, color: COLORS.textDim, lineHeight: 20 },
  rankRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  rankEmoji: { fontSize: 24 },
  rankTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  rankMin: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
});
