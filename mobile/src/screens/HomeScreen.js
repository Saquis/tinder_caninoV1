import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows } from '../styles/theme';

export default function HomeScreen({ navigation, onLogout }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 TinderCanino</Text>
      <Text style={styles.subtitle}>Busca compañeros para tu perro</Text>

      <View style={styles.card}>
        <MaterialIcons name="pets" size={50} color={colors.primary} />
        <Text style={styles.cardTitle}>Explorar</Text>
        <Text style={styles.cardText}>
          Aquí aparecerán los perros{'\n'}cerca de ti para hacer match
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        activeOpacity={0.7}
      >
        <MaterialIcons name="logout" size={18} color={colors.textWhite} style={{ marginRight: spacing.sm }} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 40,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
    width: '100%',
    ...shadows.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cardText: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  logoutText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});
