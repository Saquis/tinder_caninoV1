import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.emoji}>🐾</Text>
      <Text style={styles.title}>TinderCanino</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xxxl,
    letterSpacing: 1,
  },
  loader: {
    marginTop: spacing.sm,
  },
});
