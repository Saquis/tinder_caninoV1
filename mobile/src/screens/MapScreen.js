// MapScreen — Mapa estático de perros cercanos
// Sin dependencias externas: usa View + gradiente para simular el mapa
import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, Image, Dimensions
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadows } from '../styles/theme';
import { api } from '../api/client';

const { width } = Dimensions.get('window');
const MAP_SIZE = width - spacing.xxl * 2;

// Mock data para test visual
const MOCK_CERCANOS = [
  {
    id: 1,
    nombre: 'Luna',
    raza: 'Labrador',
    edadMeses: 24,
    foto: null,
    distancia: 1.2,
    proposito: 'jugar',
    sexo: 'hembra',
  },
  {
    id: 2,
    nombre: 'Max',
    raza: 'Pastor Alemán',
    edadMeses: 36,
    foto: null,
    distancia: 3.5,
    proposito: 'pasear',
    sexo: 'macho',
  },
  {
    id: 3,
    nombre: 'Toby',
    raza: 'Beagle',
    edadMeses: 18,
    foto: null,
    distancia: 0.8,
    proposito: 'todo',
    sexo: 'macho',
  },
  {
    id: 4,
    nombre: 'Canela',
    raza: 'Golden',
    edadMeses: 12,
    foto: null,
    distancia: 5.2,
    proposito: 'reproduccion',
    sexo: 'hembra',
  },
  {
    id: 5,
    nombre: 'Rocky',
    raza: 'Bulldog',
    edadMeses: 48,
    foto: null,
    distancia: 2.0,
    proposito: 'jugar',
    sexo: 'macho',
  },
];

const PROPOSITO_DATA = {
  jugar: { label: 'Jugar', icon: 'sports-esports', color: '#4CAF50' },
  pasear: { label: 'Pasear', icon: 'directions-walk', color: '#2196F3' },
  reproduccion: { label: 'Reproducción', icon: 'favorite', color: '#E91E63' },
  todo: { label: 'Todo', icon: 'stars', color: '#FF9800' },
};

// Genera posición pseudo-aleatoria pero estable basada en id
function getDogPosition(id, seed = 42) {
  const angle = ((id * 1.618 + seed) % 360) * (Math.PI / 180);
  const distance = 0.2 + ((id * 0.37 + 0.13) % 0.7);
  return {
    x: 50 + Math.cos(angle) * distance * 35,
    y: 50 + Math.sin(angle) * distance * 30,
  };
}

export default function MapScreen() {
  const [cercanos, setCercanos] = useState(MOCK_CERCANOS);

  // En el futuro: fetch real del backend
  // useEffect(() => {
  //   api('GET', '/perros/cercanos?lat=X&lng=Y&radio=5')
  //     .then(setCercanos)
  //     .catch(() => setCercanos(MOCK_CERCANOS));
  // }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🐾 Perros cerca</Text>
        <Text style={styles.subtitle}>
          {cercanos.length} perros en tu área
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Mapa estático View-based */}
        <View style={styles.mapCard}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
            style={styles.mapBg}
          />

          {/* Grid lines decorativas */}
          {[0, 1, 2, 3].map(i => (
            <View
              key={`h${i}`}
              style={[styles.gridLine, styles.gridH, { top: `${25 * (i + 1)}%` }]}
            />
          ))}
          {[0, 1, 2, 3].map(i => (
            <View
              key={`v${i}`}
              style={[styles.gridLine, styles.gridV, { left: `${25 * (i + 1)}%` }]}
            />
          ))}

          {/* Mi ubicación */}
          <View style={styles.myLocation}>
            <MaterialIcons name="my-location" size={20} color={colors.primary} />
            <Text style={styles.myLocationText}>Tú</Text>
          </View>

          {/* Pines de perros */}
          {cercanos.map(perro => {
            const pos = getDogPosition(perro.id);
            const pData = PROPOSITO_DATA[perro.proposito] || PROPOSITO_DATA.todo;
            return (
              <View
                key={perro.id}
                style={[
                  styles.dogPin,
                  { left: `${pos.x}%`, top: `${pos.y}%` },
                ]}
              >
                <View style={[styles.pinDot, { backgroundColor: pData.color }]}>
                  <MaterialIcons name="pets" size={12} color="#fff" />
                </View>
                <Text style={styles.pinLabel}>{perro.nombre}</Text>
              </View>
            );
          })}

          {/* Brújula */}
          <View style={styles.compass}>
            <MaterialIcons name="explore" size={22} color={colors.accentDark} />
          </View>
        </View>

        {/* Lista de perros cercanos */}
        <Text style={styles.listTitle}>Cerca de ti</Text>
        {cercanos.map(perro => {
          const pData = PROPOSITO_DATA[perro.proposito] || PROPOSITO_DATA.todo;
          return (
            <Pressable key={perro.id} style={styles.dogCard}>
              <View style={styles.dogAvatar}>
                {perro.foto ? (
                  <Image source={{ uri: perro.foto }} style={styles.avatarImg} />
                ) : (
                  <MaterialIcons name="pets" size={28} color={colors.accent} />
                )}
              </View>
              <View style={styles.dogInfo}>
                <View style={styles.dogNameRow}>
                  <Text style={styles.dogName}>{perro.nombre}</Text>
                  <MaterialIcons
                    name={perro.sexo === 'macho' ? 'male' : 'female'}
                    size={16}
                    color={perro.sexo === 'macho' ? '#5AC8FA' : '#FF69B4'}
                  />
                </View>
                <Text style={styles.dogRaza}>
                  {perro.raza} • {Math.floor(perro.edadMeses / 12)}a {perro.edadMeses % 12}m
                </Text>
                <View style={styles.dogBadges}>
                  <View style={[styles.miniBadge, { backgroundColor: pData.color + '20' }]}>
                    <MaterialIcons name={pData.icon} size={12} color={pData.color} />
                    <Text style={[styles.miniBadgeText, { color: pData.color }]}>
                      {pData.label}
                    </Text>
                  </View>
                  <View style={styles.distBadge}>
                    <FontAwesome name="location-arrow" size={10} color={colors.accentDark} />
                    <Text style={styles.distText}>{perro.distancia} km</Text>
                  </View>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
          );
        })}

        {cercanos.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="map" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No hay perros cerca</Text>
            <Text style={styles.emptyText}>Amplía el radio de búsqueda o vuelve más tarde</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 40,
  },
  mapCard: {
    width: MAP_SIZE,
    height: MAP_SIZE * 0.75,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.md,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  gridH: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  myLocation: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  myLocationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  compass: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogPin: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -14 }, { translateY: -20 }],
  },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...shadows.sm,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    overflow: 'hidden',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  dogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  dogAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: 'cover',
  },
  dogInfo: {
    flex: 1,
  },
  dogNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dogName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dogRaza: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  dogBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentDark,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
