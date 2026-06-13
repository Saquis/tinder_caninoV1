// FilterModal — Modal de filtros con paleta TinderCanino
import React, { useState } from 'react';
import {
  View, Text, Modal, Pressable, StyleSheet, ScrollView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows } from '../styles/theme';

const PROPOSITOS = [
  { key: null, label: 'Todos', icon: 'stars' },
  { key: 'jugar', label: 'Jugar', icon: 'sports-esports' },
  { key: 'pasear', label: 'Pasear', icon: 'directions-walk' },
  { key: 'reproduccion', label: 'Reproducción', icon: 'favorite' },
  { key: 'todo', label: 'Todo', icon: 'category' },
];

const DISTANCIAS = [5, 10, 25, 50, 100, 200];

export default function FilterModal({ visible, onCerrar, filtrosActuales, onAplicar }) {
  const [proposito, setProposito] = useState(filtrosActuales.proposito || null);
  const [distanciaMax, setDistanciaMax] = useState(filtrosActuales.distanciaMax || 50);
  const [edadMax, setEdadMax] = useState(filtrosActuales.edadMax || null);

  const handleAplicar = () => {
    onAplicar({
      proposito,
      distanciaMax: distanciaMax !== 50 ? distanciaMax : undefined,
      edadMax,
    });
    onCerrar();
  };

  const handleLimpiar = () => {
    setProposito(null);
    setDistanciaMax(50);
    setEdadMax(null);
    onAplicar({});
    onCerrar();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>🐾 Filtros</Text>
            <Pressable onPress={onCerrar}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Propósito */}
            <Text style={styles.sectionTitle}>Propósito</Text>
            <View style={styles.propositoGrid}>
              {PROPOSITOS.map(p => (
                <Pressable
                  key={p.key || 'todos'}
                  style={[styles.chip, proposito === p.key && styles.chipSelected]}
                  onPress={() => setProposito(p.key)}
                >
                  <MaterialIcons
                    name={p.icon}
                    size={18}
                    color={proposito === p.key ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.chipText, proposito === p.key && styles.chipTextSelected]}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Distancia */}
            <Text style={styles.sectionTitle}>Distancia máxima</Text>
            <Text style={styles.valorActual}>{distanciaMax} km 🐾</Text>
            <View style={styles.sliderRow}>
              {DISTANCIAS.map(d => (
                <Pressable
                  key={d}
                  style={[styles.distChip, distanciaMax === d && styles.chipSelected]}
                  onPress={() => setDistanciaMax(d)}
                >
                  <Text style={[styles.chipText, distanciaMax === d && styles.chipTextSelected]}>
                    {d} km
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Edad máxima */}
            <Text style={styles.sectionTitle}>Edad máxima</Text>
            <View style={styles.sliderRow}>
              {[null, 12, 24, 48, 72, 120].map(e => (
                <Pressable
                  key={e || 999}
                  style={[styles.distChip, edadMax === e && styles.chipSelected]}
                  onPress={() => setEdadMax(e)}
                >
                  <Text style={[styles.chipText, edadMax === e && styles.chipTextSelected]}>
                    {e ? `${Math.floor(e / 12)}a` : 'Todas'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Botones */}
          <View style={styles.footer}>
            <Pressable style={styles.limpiarBtn} onPress={handleLimpiar}>
              <Text style={styles.limpiarText}>Limpiar</Text>
            </Pressable>
            <Pressable style={styles.aplicarBtn} onPress={handleAplicar}>
              <Text style={styles.aplicarText}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(61, 43, 26, 0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    padding: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  valorActual: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  propositoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0E8',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  sliderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  distChip: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  limpiarBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
  },
  limpiarText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 15,
  },
  aplicarBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.sm,
  },
  aplicarText: {
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 15,
  },
});
