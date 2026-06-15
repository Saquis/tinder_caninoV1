// MapScreen v1 — View-based map (decorativo, sin librerías nativas)
// GPS real + API real + lista "Cerca de ti"
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows } from '../styles/theme';
import { apiWithRefresh } from '../api/client';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const PROPOSITO_DATA = {
  jugar: { label: 'Jugar', icon: 'sports-esports', color: '#4CAF50' },
  pasear: { label: 'Pasear', icon: 'directions-walk', color: '#2196F3' },
  reproduccion: { label: 'Reproducción', icon: 'favorite', color: '#E91E63' },
  todo: { label: 'Todo', icon: 'stars', color: '#FF9800' },
};

export default function MapScreen() {
  const [cercanos, setCercanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('obteniendo');
  const [selectedDog, setSelectedDog] = useState(null);

  useEffect(() => { obtenerUbicacion(); }, []);

  useEffect(() => {
    if (miUbicacion) cargarCercanos();
  }, [miUbicacion]);

  const obtenerUbicacion = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('[Mapa] GPS denegado');
        setMiUbicacion({ lat: -2.170, lng: -79.922 });
        setGpsStatus('denegado');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      console.log('[Mapa] GPS real:', coords.lat.toFixed(4), coords.lng.toFixed(4));
      setMiUbicacion(coords);
      setGpsStatus('ok');
    } catch (error) {
      console.log('[Mapa] Error GPS:', error);
      setMiUbicacion({ lat: -2.170, lng: -79.922 });
      setGpsStatus('error');
    }
  };

  const cargarCercanos = async () => {
    setLoading(true);
    try {
      const lat = miUbicacion?.lat || -2.170;
      const lng = miUbicacion?.lng || -79.922;
      const data = await apiWithRefresh('GET',
        `/perros/explorar?latitud=${lat}&longitud=${lng}&distanciaMax=500`);
      setCercanos(data.perros || []);
    } catch (error) {
      console.log('[Mapa] Error:', JSON.stringify(error).slice(0, 100));
      setCercanos([]);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🐾 Perros cerca</Text>
        <View style={styles.headerRow}>
          {gpsStatus === 'ok' && (
            <View style={styles.gpsBadge}>
              <MaterialIcons name="gps-fixed" size={14} color="#4CAF50" />
              <Text style={styles.gpsText}>GPS real</Text>
            </View>
          )}
          {gpsStatus !== 'ok' && (
            <View style={[styles.gpsBadge, { backgroundColor: '#FFF3E0' }]}>
              <MaterialIcons name="gps-off" size={14} color="#FF9800" />
              <Text style={[styles.gpsText, { color: '#E65100' }]}>GPS desactivado</Text>
            </View>
          )}
          <Text style={styles.subtitle}>
            {loading ? 'Buscando...' : `${cercanos.length} perros`}
          </Text>
        </View>
      </View>

      {/* Mapa decorativo View-based */}
      <View style={styles.mapView}>
        {/* Capa de gradiente verde */}
        <View style={styles.greenLayer}>
          <View style={styles.gradient1} />
          <View style={styles.gradient2} />
          <View style={styles.gradient3} />
          <View style={styles.gradient4} />
        </View>

        {/* Grid decorativo */}
        <View style={styles.grid}>
          <View style={styles.gridLineH1} />
          <View style={styles.gridLineH2} />
          <View style={styles.gridLineV1} />
          <View style={styles.gridLineV2} />
        </View>

        {/* Pines de perros reales en posiciones aleatorias predecibles */}
        {cercanos.slice(0, 12).map((perro, idx) => {
          // Posiciones predecibles basadas en índice (no aleatorias)
          const positions = [
            { x: '22%', y: '30%' }, { x: '55%', y: '20%' }, { x: '75%', y: '35%' },
            { x: '40%', y: '55%' }, { x: '15%', y: '60%' }, { x: '65%', y: '65%' },
            { x: '30%', y: '75%' }, { x: '80%', y: '55%' }, { x: '50%', y: '40%' },
            { x: '10%', y: '40%' }, { x: '85%', y: '25%' }, { x: '45%', y: '70%' },
          ];
          const pos = positions[idx % positions.length];
          const pData = PROPOSITO_DATA[perro.proposito] || PROPOSITO_DATA.todo;
          return (
            <Pressable
              key={perro.id}
              style={[styles.dogPin, { left: pos.x, top: pos.y }]}
              onPress={() => setSelectedDog(perro)}
            >
              <View style={[styles.pinDot, { backgroundColor: pData.color }]}>
                <Text style={styles.pinIcon}>🐾</Text>
              </View>
              <Text style={styles.pinName} numberOfLines={1}>{perro.nombre}</Text>
            </Pressable>
          );
        })}

        {/* Marcador del usuario */}
        <View style={styles.userPin}>
          <View style={styles.userDot}>
            <MaterialIcons name="person" size={12} color="#FFF" />
          </View>
          <View style={styles.userPulse} />
        </View>

        {/* Brújula decorativa */}
        <View style={styles.compass}>
          <MaterialIcons name="navigation" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.compassText}>N</Text>
        </View>

        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.bgCard} />
          </View>
        )}
      </View>

      {/* Preview del perro seleccionado */}
      {selectedDog && (
        <View style={styles.previewContainer}>
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <View style={styles.previewAvatar}>
                {selectedDog.fotoPrincipal ? (
                  <Image source={{ uri: selectedDog.fotoPrincipal }} style={styles.previewImg} />
                ) : (
                  <MaterialIcons name="pets" size={24} color={colors.accent} />
                )}
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{selectedDog.nombre}</Text>
                <Text style={styles.previewRaza}>{selectedDog.raza || 'Mestizo'}</Text>
              </View>
              <Pressable style={styles.previewClose} onPress={() => setSelectedDog(null)}>
                <MaterialIcons name="close" size={18} color={colors.textLight} />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Lista de perros cercanos */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>📍 Cerca de ti</Text>
          <Text style={styles.listCount}>{cercanos.length} perros</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listScroll}
        >
          {cercanos.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="pets" size={32} color={colors.border} />
              <Text style={styles.emptyText}>No hay perros cerca</Text>
              <Text style={styles.emptySub}>
                Buscamos hasta 500 km. Comparte la app para que más dueños se unan 🐾
              </Text>
            </View>
          ) : (
            cercanos.map(perro => {
              const pData = PROPOSITO_DATA[perro.proposito] || PROPOSITO_DATA.todo;
              const km = miUbicacion
                ? calcularDist(miUbicacion.lat, miUbicacion.lng,
                    perro.latitud || 0, perro.longitud || 0)
                : '?';
              return (
                <Pressable
                  key={perro.id}
                  style={styles.dogCard}
                  onPress={() => setSelectedDog(perro)}
                >
                  <View style={styles.dogAvatar}>
                    {perro.fotoPrincipal ? (
                      <Image source={{ uri: perro.fotoPrincipal }} style={styles.dogImg} />
                    ) : (
                      <View style={styles.dogPlaceholder}>
                        <MaterialIcons name="pets" size={20} color={colors.accent} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.dogName} numberOfLines={1}>{perro.nombre}</Text>
                  <View style={[styles.dogBadge, { backgroundColor: pData.color + '20' }]}>
                    <MaterialIcons name={pData.icon} size={10} color={pData.color} />
                    <Text style={[styles.dogBadgeText, { color: pData.color }]}>{pData.label}</Text>
                  </View>
                  <Text style={styles.dogDist}>{km} km 🐾</Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function calcularDist(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    paddingTop: 50, paddingHorizontal: spacing.xxl, paddingBottom: spacing.sm,
    backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginTop: 4,
  },
  gpsBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2, gap: 4,
  },
  gpsText: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  subtitle: { fontSize: 13, color: colors.textLight },

  // Mapa view-based
  mapView: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greenLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2E7D32',
  },
  gradient1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76,175,80,0.3)',
    borderBottomLeftRadius: 80,
    borderTopRightRadius: 120,
  },
  gradient2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,94,32,0.4)',
    borderTopLeftRadius: 60,
    borderBottomRightRadius: 100,
  },
  gradient3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(56,142,60,0.2)',
    borderBottomLeftRadius: 200,
    borderTopRightRadius: 60,
  },
  gradient4: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(200,230,201,0.15)',
    borderRadius: 150,
    top: -50, left: -50,
    width: 200, height: 200,
  },
  grid: { ...StyleSheet.absoluteFillObject },
  gridLineH1: {
    position: 'absolute', left: 0, right: 0, top: '33%',
    height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridLineH2: {
    position: 'absolute', left: 0, right: 0, top: '66%',
    height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridLineV1: {
    position: 'absolute', top: 0, bottom: 0, left: '33%',
    width: 1, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridLineV2: {
    position: 'absolute', top: 0, bottom: 0, left: '66%',
    width: 1, backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Pines de perros
  dogPin: {
    position: 'absolute', alignItems: 'center', zIndex: 10,
  },
  pinDot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  pinIcon: { fontSize: 13 },
  pinName: {
    color: '#fff', fontSize: 9, fontWeight: '700', marginTop: 2,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, paddingHorizontal: 4,
    overflow: 'hidden',
  },

  // Pin del usuario
  userPin: {
    position: 'absolute', bottom: '40%', left: '50%',
    marginLeft: -10, marginTop: -10, zIndex: 20,
    alignItems: 'center',
  },
  userDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    zIndex: 2,
  },
  userPulse: {
    position: 'absolute', top: -10, left: -10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(66,133,244,0.25)',
  },

  // Brújula
  compass: {
    position: 'absolute', top: 12, right: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  compassText: {
    position: 'absolute', bottom: -2, right: -2,
    fontSize: 7, fontWeight: '700', color: 'rgba(255,255,255,0.5)',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  // Preview
  previewContainer: {
    position: 'absolute', left: spacing.xxl, right: spacing.xxl, top: 370,
    zIndex: 30,
  },
  previewCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.md,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  previewAvatar: {
    width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
    backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 15, fontWeight: '700', color: colors.text },
  previewRaza: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  previewClose: { padding: spacing.sm },

  // Lista cercanos
  listContainer: {
    flex: 1, backgroundColor: colors.bgCard,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingBottom: 8,
  },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xxl, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: colors.accentDark },
  listCount: { fontSize: 13, color: colors.textLight },
  listScroll: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.md },
  emptyBox: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm, minWidth: 200 },
  emptyText: { color: colors.textLight, fontSize: 13 },
  emptySub: { color: colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  dogCard: {
    width: 120, backgroundColor: colors.bg, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.sm,
    alignItems: 'center', gap: 4, ...shadows.sm,
  },
  dogAvatar: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  dogImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  dogPlaceholder: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center',
  },
  dogName: { fontSize: 13, fontWeight: '700', color: colors.text },
  dogBadge: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2, gap: 3,
  },
  dogBadgeText: { fontSize: 10, fontWeight: '700' },
  dogDist: { fontSize: 10, color: colors.accent, fontWeight: '600' },
});
