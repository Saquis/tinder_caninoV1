import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator,
  Animated, PanResponder, Dimensions, Image, Pressable, ScrollView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { apiWithRefresh } from '../api/client';
import MatchModal from '../components/MatchModal';
import FilterModal from '../components/FilterModal';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';
import * as Location from 'expo-location';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

// 🐾 Emojis por propósito
const PROPOSITO_EMOJI = {
  jugar: '🎮',
  pasear: '🌳',
  reproduccion: '💕',
  todo: '⭐',
};

const PROPOSITO_LABEL = {
  jugar: 'Jugar',
  pasear: 'Pasear',
  reproduccion: 'Reproducción',
  todo: 'Amigos',
};

// 🐾 Iconos de personalidad (novedoso)
const PERSONALIDAD_ICONS = [
  { icon: '🐕', label: 'Sociable' },
  { icon: '🦴', label: 'Juguetón' },
  { icon: '🏠', label: 'Tranquilo' },
  { icon: '🌊', label: 'Agua' },
  { icon: '🐾', label: 'Energía 🔋' },
];

// 🐾 Cálculo de "Woof Meter" (compatibilidad visual)
const calcularAfinit = (perro) => {
  if (!perro) return 0;
  let score = 60; // base
  if (perro.castrado) score += 10;
  if (perro.sexo) score += 5;
  if (perro.proposito) score += 5;
  if (perro.descripcion && perro.descripcion.length > 20) score += 10;
  if (perro.raza) score += 10;
  return Math.min(score, 100);
};

// 🐾 Emoji según afinidad
const afinitEmoji = (score) => {
  if (score >= 85) return '💖';
  if (score >= 70) return '💛';
  if (score >= 50) return '🤍';
  return '🩶';
};

export default function SwipeScreen({ navigation }) {
  const [perros, setPerros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModal, setMatchModal] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filtros, setFiltros] = useState({});
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('obteniendo');
  const [radioActual, setRadioActual] = useState(500);
  const position = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    obtenerUbicacion();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (miUbicacion) {
      cargarPerros();
    }
  }, [miUbicacion]);

  const obtenerUbicacion = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('[Swipe] GPS denegado, usando coords por defecto');
        setMiUbicacion({ lat: -2.170, lng: -79.922 });
        setGpsStatus('denegado');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      console.log('[Swipe] GPS real:', coords.lat.toFixed(4), coords.lng.toFixed(4));
      setMiUbicacion(coords);
      setGpsStatus('ok');
    } catch (error) {
      console.log('[Swipe] Error GPS:', error);
      setMiUbicacion({ lat: -2.170, lng: -79.922 });
      setGpsStatus('error');
    }
  };

  const cargarPerros = async () => {
    if (!miUbicacion) return;
    setLoading(true);
    try {
      const qsParts = [];
      qsParts.push('latitud=' + miUbicacion.lat.toFixed(6));
      qsParts.push('longitud=' + miUbicacion.lng.toFixed(6));
      qsParts.push('distanciaMax=' + 500); // Todo Ecuador
      if (filtros.proposito) qsParts.push('proposito=' + encodeURIComponent(filtros.proposito));
      if (filtros.edadMax) qsParts.push('edadMax=' + filtros.edadMax);
      const qs = qsParts.length ? '?' + qsParts.join('&') : '';
      const data = await apiWithRefresh('GET', `/perros/explorar${qs}`);
      setPerros(data.perros || []);
    } catch (error) {
      const msg = typeof error === 'string' ? error
        : error.message || error.mensaje
        || (typeof error.error === 'string' ? error.error : error.error?.message || error.error?.mensaje)
        || 'Error al cargar perros';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const registrarSwipe = async (usuarioDestinoId, tipo) => {
    try {
      const data = await apiWithRefresh('POST', '/swipes', {
        usuarioDestino: usuarioDestinoId,
        tipo,
      });
      if (data.match?.encontrado) {
        setMatchModal(data.match);
      }
    } catch (error) {
      const msg = typeof error === 'string' ? error : error.message || 'Error';
      if (!msg.includes('401')) Alert.alert('Error', msg);
    }
  };

  const calcularDistancia = (lat2, lng2) => {
    if (!lat2 || !lng2 || !miUbicacion) return '?';
    const { lat: lat1, lng: lng1 } = miUbicacion;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const swipeCard = (direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : direction === 'left' ? -SCREEN_WIDTH - 100 : 0;
    const y = direction === 'up' ? -500 : 0;
    Animated.timing(position, {
      toValue: { x, y },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      const perro = perros[currentIndex];
      if (perro) {
        const tipo = direction === 'right' ? 'like' : direction === 'up' ? 'super' : 'nope';
        registrarSwipe(perro.usuarioId, tipo);
      }
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex(prev => prev + 1);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          swipeCard('up');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const renderCard = (perro) => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-12deg', '0deg', '12deg'],
    });

    const likeOpacity = position.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const nopeOpacity = position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const afinitScore = calcularAfinit(perro);
    const km = calcularDistancia(perro.latitud, perro.longitud);

    return (
      <Animated.View
        key={perro.id}
        style={[styles.card, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
        {/* Foto */}
        <View style={styles.fotoBox}>
          {perro.fotoPrincipal ? (
            <Image source={{ uri: perro.fotoPrincipal }} style={styles.fotoImage} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <MaterialIcons name="pets" size={50} color={colors.border} />
            </View>
          )}

          {/* Gradiente inferior sobre la foto */}
          <View style={styles.fotoGradient}>
            <Text style={styles.cardNombre}>
              {perro.nombre}
              {perro.edadMeses ? (
                <Text style={styles.cardEdad}>
                  {' '}• {Math.floor(perro.edadMeses / 12)}
                  {perro.edadMeses % 12 > 0 ? ` ${perro.edadMeses % 12}m` : 'a'}
                </Text>
              ) : null}
            </Text>
            <View style={styles.cardSubRow}>
              <Text style={styles.cardRaza}>{perro.raza || 'Mestizo'}</Text>
              <Text style={styles.cardDistancia}>{km !== '?' ? `${km} km 🐾` : ''}</Text>
            </View>
          </View>

          {/* Botón reportar */}
          <Pressable
            style={styles.reportBtn}
            onPress={() => {
              console.log('[Swipe] ⋮ Reportar abierto para usuario:', perro.usuarioId, perro.nombre);
              Alert.alert('Reportar usuario', '¿Por qué quieres reportar a este usuario?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Foto falsa', onPress: () => reportarUsuario(perro.usuarioId, 'Foto falsa') },
                { text: 'Perfil inapropiado', onPress: () => reportarUsuario(perro.usuarioId, 'Perfil inapropiado') },
                { text: 'Spam', onPress: () => reportarUsuario(perro.usuarioId, 'Spam') },
                { text: 'Otro', onPress: () => {
                  console.log('[Swipe] Reportar Otro seleccionado');
                  Alert.prompt ? Alert.prompt('Describe el problema', '', (text) =>
                    reportarUsuario(perro.usuarioId, 'Otro', text)
                  ) : Alert.alert('Reportar', 'Reporte enviado. Gracias.');
                }},
              ]);
            }}
          >
            <MaterialIcons name="more-vert" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* 🆕 Woof Meter - indicador de compatibilidad */}
          <View style={styles.afinitBadge}>
            <Text style={styles.afinitEmoji}>{afinitEmoji(afinitScore)}</Text>
            <Text style={styles.afinitText}>{afinitScore}%</Text>
          </View>

          {/* Badge propósito */}
          <View style={[styles.propBadge,
            perro.proposito === 'jugar' ? styles.propJugar :
            perro.proposito === 'pasear' ? styles.propPasear :
            perro.proposito === 'reproduccion' ? styles.propRepro : styles.propTodo
          ]}>
            <Text style={styles.propBadgeText}>
              {PROPOSITO_EMOJI[perro.proposito] || '⭐'}{' '}
              {PROPOSITO_LABEL[perro.proposito] || 'Amigos'}
            </Text>
          </View>
        </View>

        {/* Info del perro */}
        <ScrollView style={styles.cardInfo} showsVerticalScrollIndicator={false}>
          {perro.descripcion && (
            <Text style={styles.cardDesc}>{perro.descripcion}</Text>
          )}
          <View style={styles.cardMeta}>
            {perro.sexo && (
              <Text style={styles.cardSexo}>
                {perro.sexo === 'macho' ? '♂️ Macho' : '♀️ Hembra'}
                {perro.castrado ? ' · Esterilizado' : ''}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Overlay LIKE */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
          <Text style={styles.overlayText}>❤️ ¡ME GUSTA!</Text>
        </Animated.View>

        {/* Overlay NOPE */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
          <Text style={[styles.overlayText, { color: colors.error }]}>✕ NO</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  const reportarUsuario = async (usuarioId, motivo, descripcion) => {
    console.log('[Swipe] reportarUsuario → usuarioId:', usuarioId, 'motivo:', motivo, 'desc:', descripcion?.slice(0, 50));
    try {
      await apiWithRefresh('POST', '/usuarios/reportar', {
        reportadoId: usuarioId,
        motivo,
        descripcion: descripcion || '',
      });
      console.log('[Swipe] Reporte enviado OK');
      Alert.alert('Reportado', 'Gracias por reportar. Revisaremos el perfil.');
    } catch (error) {
      const msg = error?.message || error?.mensaje || 'Error al reportar';
      console.log('[Swipe] Error al reportar:', msg);
      Alert.alert('Error', msg);
    }
  };

  const handleAbrirChat = () => {
    if (matchModal) {
      const matchId = matchModal.matchId;
      setMatchModal(null);
      navigation.navigate('Matches', { screen: 'Mensajes', params: { matchId } });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <MaterialIcons name="pets" size={40} color={colors.accent} />
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 16 }} />
          <Text style={styles.loadingText}>Buscando perros...</Text>
        </View>
      </View>
    );
  }

  if (perros.length === 0 || currentIndex >= perros.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCard}>
          <MaterialIcons name="pets" size={50} color={colors.border} />
          <Text style={styles.emptyTitle}>
            {perros.length === 0 ? 'No hay perros en tu zona 🐾' : '¡Ups! No hay más perros'}
          </Text>
          <Text style={styles.emptyText}>
            {perros.length === 0
              ? `Buscamos hasta ${radioActual} km a la redonda y no encontramos perros.\nComparte la app con otros dueños o vuelve más tarde.`
              : 'Ya viste todos los perros disponibles.\nVuelve pronto, seguro hay más.'}
          </Text>
          <Pressable
            style={styles.refreshBtn}
            onPress={() => { setCurrentIndex(0); cargarPerros(); }}
          >
            <MaterialIcons name="refresh" size={18} color={colors.textWhite} />
            <Text style={styles.refreshText}>Recargar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const perroActual = perros[currentIndex];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 Explorar</Text>
        <View style={styles.headerRight}>
          {Object.keys(filtros).length > 0 && (
            <View style={styles.filtroActivoDot} />
          )}
          <Pressable onPress={() => setFilterVisible(true)} style={styles.filterBtn}>
            <MaterialIcons name="filter-list" size={20} color={colors.accentDark} />
          </Pressable>
          <Text style={styles.headerCount}>
            {currentIndex + 1} / {perros.length}
          </Text>
        </View>
      </View>

      {/* Card swipable */}
      {renderCard(perroActual)}

      {/* Botones de acción — rediseñados con paleta TinderCanino */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, styles.actionNope]}
          onPress={() => swipeCard('left')}
        >
          <MaterialIcons name="close" size={26} color={colors.textWhite} />
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionSuper]}
          onPress={() => swipeCard('up')}
        >
          <MaterialIcons name="star" size={22} color={colors.textWhite} />
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionLike]}
          onPress={() => swipeCard('right')}
        >
          <MaterialIcons name="favorite" size={26} color={colors.textWhite} />
        </Pressable>
      </View>

      <Text style={styles.actionHint}>
        Desliza → Me gusta  ·  ← No  ·  ↑ Super
      </Text>

      {/* Filter modal */}
      <FilterModal
        visible={filterVisible}
        onCerrar={() => setFilterVisible(false)}
        filtrosActuales={filtros}
        onAplicar={(nuevosFiltros) => {
          setFiltros(nuevosFiltros);
          setCurrentIndex(0);
          cargarPerros();
        }}
      />

      {/* Match modal */}
      <MatchModal
        visible={!!matchModal}
        matchData={matchModal}
        onCerrar={() => setMatchModal(null)}
        onAbrirChat={handleAbrirChat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  radioBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FFF3E0', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  radioBadgeText: {
    fontSize: 11, fontWeight: '700', color: colors.accentDark,
  },
  filtroActivoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 1,
  },
  card: {
    width: SCREEN_WIDTH - 32,
    height: 460,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.lg,
  },
  fotoBox: {
    height: 360,
    backgroundColor: colors.borderLight,
    position: 'relative',
  },
  fotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  propBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  propJugar: {
    backgroundColor: colors.like,
  },
  propPasear: {
    backgroundColor: colors.info,
  },
  propRepro: {
    backgroundColor: colors.error,
  },
  propTodo: {
    backgroundColor: colors.warning,
  },
  propBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  // 🆕 Woof Meter badge
  afinitBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
    ...shadows.sm,
  },
  afinitEmoji: {
    fontSize: 14,
  },
  afinitText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  cardInfo: {
    flex: 1,
    padding: spacing.lg,
  },
  cardNombre: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardEdad: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  cardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  cardRaza: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  cardDistancia: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cardSexo: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  cardDesc: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '400',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 3,
  },
  likeOverlay: {
    right: 20,
    borderColor: colors.like,
    backgroundColor: 'rgba(76,175,80,0.15)',
  },
  nopeOverlay: {
    left: 20,
    borderColor: colors.error,
    backgroundColor: 'rgba(229,57,53,0.15)',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.like,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  actionNope: {
    backgroundColor: colors.nope,
  },
  actionSuper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.superLike,
  },
  actionLike: {
    backgroundColor: colors.like,
  },
  actionHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  loadingCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  loadingText: {
    color: colors.textLight,
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 320,
    ...shadows.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  refreshText: {
    color: colors.textWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  reportBtn: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
