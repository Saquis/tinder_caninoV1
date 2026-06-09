import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator,
  Animated, PanResponder, Dimensions, Image
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { apiWithRefresh } from '../api/client';
import MatchModal from '../components/MatchModal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

export default function SwipeScreen({ navigation }) {
  const [perros, setPerros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModal, setMatchModal] = useState(null);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    cargarPerros();
  }, []);

  const cargarPerros = async () => {
    setLoading(true);
    try {
      const data = await apiWithRefresh('GET', '/perros/explorar');
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
        tipo, // 'like' | 'nope' | 'super'
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
    // Usamos coordenadas fijas del usuario (se pueden mejorar con GPS real)
    // El backend ya filtra por distancia, esto es solo display
    if (!lat2 || !lng2) return '?';
    const lat1 = -2.170; // Guayaquil (default)
    const lng1 = -79.922;
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
      outputRange: ['-15deg', '0deg', '15deg'],
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

    return (
      <Animated.View
        style={[styles.card, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
        {/* Foto */}
        <View style={styles.fotoBox}>
          {perro.fotoPrincipal ? (
            <Image source={{ uri: perro.fotoPrincipal }} style={styles.fotoImage} />
          ) : (
            <MaterialIcons name="pets" size={60} color="#444" />
          )}
          {/* Gradiente + nombre sobre la foto */}
          <View style={styles.fotoGradient}>
            <Text style={styles.cardNombre}>
              {perro.nombre}
              {perro.edadMeses ? <Text style={styles.cardEdad}> • {Math.floor(perro.edadMeses / 12)}a {perro.edadMeses % 12}m</Text> : null}
            </Text>
            <Text style={styles.cardRaza}>{perro.raza || 'Mestizo'}</Text>
          </View>
          {/* Badge propósito */}
          <View style={[styles.propBadge,
            perro.proposito === 'jugar' ? styles.propJugar :
            perro.proposito === 'pasear' ? styles.propPasear :
            perro.proposito === 'reproduccion' ? styles.propRepro : styles.propTodo
          ]}>
            <Text style={styles.propBadgeText}>
              {perro.proposito === 'jugar' ? '🎮 Jugar' :
               perro.proposito === 'pasear' ? '🚶 Pasear' :
               perro.proposito === 'reproduccion' ? '💕 Reproducción' : '⭐ Todo'}
            </Text>
          </View>
        </View>

        {/* Info del perro */}
        <View style={styles.cardInfo}>
          {perro.descripcion && (
            <Text style={styles.cardDesc} numberOfLines={2}>{perro.descripcion}</Text>
          )}
          <View style={styles.cardMeta}>
            {perro.sexo && (
              <Text style={styles.cardSexo}>
                {perro.sexo === 'macho' ? '♂️ Macho' : '♀️ Hembra'}
                {perro.castrado ? ' • Esterilizado' : ''}
              </Text>
            )}
            {perro.latitud && perro.longitud && (
              <Text style={styles.cardDistancia}>📍 {calcularDistancia(perro.latitud, perro.longitud)} km</Text>
            )}
          </View>
        </View>

        {/* Overlay LIKE */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>

        {/* Overlay NOPE */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
          <Text style={styles.overlayText}>NOPE</Text>
        </Animated.View>
      </Animated.View>
    );
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
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Buscando perros cerca...</Text>
      </View>
    );
  }

  if (perros.length === 0 || currentIndex >= perros.length) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="pets" size={60} color="#444" />
        <Text style={styles.emptyTitle}>No hay más perros</Text>
        <Text style={styles.emptyText}>
          {perros.length === 0
            ? 'No encontramos perros cerca. Intenta más tarde.'
            : 'Ya viste todos los perros disponibles. Vuelve pronto.'}
        </Text>
        <View
          style={styles.refreshBtn}
          onTouchEnd={() => { setCurrentIndex(0); cargarPerros(); }}
        >
          <MaterialIcons name="refresh" size={20} color="#34C759" />
          <Text style={styles.refreshText}>Recargar</Text>
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
        <Text style={styles.headerCount}>
          {currentIndex + 1} / {perros.length}
        </Text>
      </View>

      {/* Card swipable */}
      {renderCard(perroActual)}

      {/* Botones de acción */}
      <View style={styles.actionsRow}>
        <View
          style={[styles.actionBtn, styles.actionNope]}
          onTouchEnd={() => swipeCard('left')}
        >
          <MaterialIcons name="close" size={28} color="#FF3B30" />
        </View>
        <View
          style={[styles.actionBtn, styles.actionSuper]}
          onTouchEnd={() => swipeCard('up')}
        >
          <MaterialIcons name="star" size={24} color="#007AFF" />
        </View>
        <View
          style={[styles.actionBtn, styles.actionLike]}
          onTouchEnd={() => swipeCard('right')}
        >
          <MaterialIcons name="favorite" size={28} color="#34C759" />
        </View>
      </View>

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
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 12,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34C759',
  },
  headerCount: {
    color: '#666',
    fontSize: 14,
  },
  card: {
    width: SCREEN_WIDTH - 32,
    height: 440,
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  fotoBox: {
    height: 350,
    backgroundColor: '#2A2A2A',
    position: 'relative',
  },
  fotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fotoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  propBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  propJugar: {
    backgroundColor: '#34C759',
  },
  propPasear: {
    backgroundColor: '#5AC8FA',
  },
  propRepro: {
    backgroundColor: '#FF2D55',
  },
  propTodo: {
    backgroundColor: '#FF9500',
  },
  propBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 14,
  },
  cardNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardEdad: {
    fontSize: 16,
    fontWeight: 'normal',
    color: 'rgba(255,255,255,0.8)',
  },
  cardRaza: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  cardSexo: {
    fontSize: 13,
    color: '#888',
  },
  cardDistancia: {
    fontSize: 13,
    color: '#888',
  },
  cardDesc: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 18,
  },
  overlay: {
    position: 'absolute',
    top: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeOverlay: {
    right: 20,
    borderColor: '#34C759',
  },
  nopeOverlay: {
    left: 20,
    borderColor: '#FF3B30',
  },
  overlayText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  actionNope: {
    borderColor: '#FF3B30',
    backgroundColor: '#2A0A0A',
  },
  actionSuper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderColor: '#007AFF',
    backgroundColor: '#0A1A2A',
  },
  actionLike: {
    borderColor: '#34C759',
    backgroundColor: '#0A2A0A',
  },
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 14,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
  },
  refreshText: {
    color: '#34C759',
    fontWeight: '600',
  },
});
