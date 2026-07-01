// PerroDetailModal — Modal de detalle completo de un perro (fotos + info)
// Se abre desde SwipeScreen y MapScreen

import React, { useState, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Modal, Image,
  ScrollView, Dimensions, Animated, FlatList
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = width - 32;

const PROPOSITO_DATA = {
  jugar: { label: 'Jugar', icon: 'sports-esports', color: '#4CAF50' },
  pasear: { label: 'Pasear', icon: 'directions-walk', color: '#2196F3' },
  reproduccion: { label: 'Reproducción', icon: 'favorite', color: '#E91E63' },
  todo: { label: 'Todo', icon: 'stars', color: '#FF9800' },
};

export default function PerroDetailModal({ visible, perro, onCerrar, km }) {
  const [fotoIndex, setFotoIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!perro) return null;

  const todasLasFotos = [];
  if (perro.fotoPrincipal) {
    todasLasFotos.push(perro.fotoPrincipal);
  }
  if (perro.fotos && perro.fotos.length > 0) {
    perro.fotos.forEach(f => {
      const url = typeof f === 'string' ? f : f.url;
      if (url && !todasLasFotos.includes(url)) {
        todasLasFotos.push(url);
      }
    });
  }

  const pData = PROPOSITO_DATA[perro.proposito] || PROPOSITO_DATA.todo;
  const edadStr = perro.edadMeses
    ? `${Math.floor(perro.edadMeses / 12)}a ${perro.edadMeses % 12}m`
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header con cerrar */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🐾 Perfil</Text>
            <Pressable onPress={onCerrar} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollInner}
          >
            {/* ===== GALERÍA DE FOTOS ===== */}
            {todasLasFotos.length > 0 ? (
              <View style={styles.galeriaContainer}>
                <FlatList
                  data={todasLasFotos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, idx) => `foto-${idx}`}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / MODAL_WIDTH);
                    setFotoIndex(idx);
                  }}
                  renderItem={({ item }) => (
                    <View style={styles.fotoSlide}>
                      <Image
                        source={{ uri: item }}
                        style={styles.fotoFull}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                />
                {/* Dots indicadores */}
                {todasLasFotos.length > 1 && (
                  <View style={styles.dotsContainer}>
                    {todasLasFotos.map((_, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.dot,
                          idx === fotoIndex && styles.dotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
                {/* Contador de fotos */}
                <View style={styles.fotoCountBadge}>
                  <MaterialIcons name="photo-library" size={12} color="#FFF" />
                  <Text style={styles.fotoCountText}>
                    {fotoIndex + 1}/{todasLasFotos.length}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.sinFoto}>
                <MaterialIcons name="pets" size={50} color={colors.border} />
                <Text style={styles.sinFotoText}>Sin fotos</Text>
              </View>
            )}

            {/* ===== NOMBRE + EDAD ===== */}
            <View style={styles.nombreRow}>
              <Text style={styles.nombre}>
                {perro.nombre || 'Sin nombre'}
                {edadStr ? <Text style={styles.edad}> • {edadStr}</Text> : null}
              </Text>
            </View>

            {/* ===== BADGES ===== */}
            <View style={styles.badgesRow}>
              {/* Propósito */}
              <View style={[styles.badge, { backgroundColor: pData.color + '20' }]}>
                <MaterialIcons name={pData.icon} size={14} color={pData.color} />
                <Text style={[styles.badgeText, { color: pData.color }]}>
                  {pData.label}
                </Text>
              </View>

              {/* Distancia */}
              {km !== undefined && km !== null && (
                <View style={styles.badge}>
                  <MaterialIcons name="location-on" size={14} color={colors.accent} />
                  <Text style={styles.badgeText}>{km} km 🐾</Text>
                </View>
              )}

              {/* Sexo */}
              {perro.sexo && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {perro.sexo === 'macho' ? '♂️ Macho' : '♀️ Hembra'}
                    {perro.castrado ? ' · Esterilizado' : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* ===== RAZA ===== */}
            {perro.raza ? (
              <View style={styles.infoRow}>
                <MaterialIcons name="pets" size={16} color={colors.accent} />
                <Text style={styles.infoText}>{perro.raza}</Text>
              </View>
            ) : null}

            {/* ===== DESCRIPCIÓN ===== */}
            {perro.descripcion ? (
              <View style={styles.descBox}>
                <Text style={styles.descLabel}>📝 Descripción</Text>
                <Text style={styles.descText}>{perro.descripcion}</Text>
              </View>
            ) : null}

            {/* ===== INFO ADICIONAL ===== */}
            <View style={styles.metaGrid}>
              {perro.castrado !== undefined && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Esterilizado</Text>
                  <Text style={styles.metaValue}>
                    {perro.castrado ? '✅ Sí' : '❌ No'}
                  </Text>
                </View>
              )}
              {perro.edadMeses !== null && perro.edadMeses !== undefined && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Edad</Text>
                  <Text style={styles.metaValue}>{edadStr || `${perro.edadMeses} meses`}</Text>
                </View>
              )}
            </View>

            {/* Espacio inferior */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '88%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: 20,
  },

  // Galería
  galeriaContainer: {
    position: 'relative',
  },
  fotoSlide: {
    width: MODAL_WIDTH,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoFull: {
    width: MODAL_WIDTH - 16,
    height: 300,
    borderRadius: radius.lg,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  fotoCountBadge: {
    position: 'absolute',
    top: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  fotoCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sinFoto: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sinFotoText: {
    color: colors.textLight,
    fontSize: 14,
  },

  // Info
  nombreRow: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  nombre: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  edad: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textLight,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  descBox: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  metaItem: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flex: 1,
    minWidth: 100,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
