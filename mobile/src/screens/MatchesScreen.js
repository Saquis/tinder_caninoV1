import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator,
  Image, RefreshControl, Animated, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { apiWithRefresh } from '../api/client';

// ─── Helpers ────────────────────────────────────────────────

function tiempoRelativo(isoFecha) {
  if (!isoFecha) return '';
  try {
    const ahora = new Date();
    const fecha = new Date(isoFecha);
    if (isNaN(fecha.getTime())) return '';
    const diffMs = ahora - fecha;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHoras < 6) return `hace ${diffHoras}h`;

    const hoy = ahora.toDateString();
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    const opciones = { hour: '2-digit', minute: '2-digit' };

    if (fecha.toDateString() === hoy) {
      return fecha.toLocaleTimeString('es-EC', opciones);
    }
    if (fecha.toDateString() === ayer.toDateString()) return 'Ayer';

    return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  } catch (_) {
    return '';
  }
}

function esReciente(isoFecha, horas = 24) {
  if (!isoFecha) return false;
  try {
    const diffMs = new Date() - new Date(isoFecha);
    return diffMs < horas * 3600000;
  } catch (_) {
    return false;
  }
}

// ─── Componente ─────────────────────────────────────────────

export default function MatchesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const cargarMatches = useCallback(async () => {
    try {
      const data = await apiWithRefresh('GET', '/matches');
      setMatches(data.matches || []);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      const msg = typeof error === 'string' ? error : error?.message || 'Error al cargar matches';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim]);

  // Recargar al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarMatches();
    }, [cargarMatches])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarMatches();
  }, [cargarMatches]);

  const eliminarMatch = useCallback((matchId) => {
    Alert.alert('Eliminar match', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await apiWithRefresh('DELETE', `/matches/${matchId}`);
            setMatches(prev => prev.filter(m => m.id !== matchId));
          } catch (error) {
            Alert.alert('Error', error?.message || 'No se pudo eliminar');
          }
        },
      },
    ]);
  }, []);

  const abrirChat = useCallback((match) => {
    navigation.navigate('Mensajes', {
      matchId: match.id,
      perroNombre: match.perro?.nombre || 'Match',
    });
  }, [navigation]);

  // ── Separar matches ──

  const sinMensajes = matches
    .filter(m => !m.tieneMensajes)
    .sort((a, b) => new Date(b.fechaMatch) - new Date(a.fechaMatch));

  const conMensajes = matches
    .filter(m => m.tieneMensajes)
    .sort((a, b) => new Date(b.ultimoMensajeFecha) - new Date(a.ultimoMensajeFecha));

  const hayNuevos = sinMensajes.length > 0;

  // ── Loading ──

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  // ── Vacío ──

  if (matches.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>🐾 Mis Matches</Text>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={60} color="#444" />
          <Text style={styles.emptyTitle}>Sin matches aún</Text>
          <Text style={styles.emptyText}>
            Sigue explorando perros y haz like para encontrar matches
          </Text>
        </View>
      </View>
    );
  }

  // ── Render ──

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>🐾 Mis Matches</Text>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={conMensajes}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {hayNuevos && (
                <>
                  <Text style={styles.sectionHeader}>Nuevos matches</Text>
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.nuevosScroll}
                  >
                    {sinMensajes.map(m => {
                      const perro = m.perro || {};
                      const nuevo = esReciente(m.fechaMatch, 24);
                      return (
                        <Pressable
                          key={m.id}
                          style={styles.nuevoCard}
                          onPress={() => abrirChat(m)}
                          onLongPress={() => eliminarMatch(m.id)}
                        >
                          <View style={styles.nuevoAvatarWrapper}>
                            <View style={styles.nuevoAvatarBorder}>
                              <View style={styles.nuevoAvatarBox}>
                                {perro.fotoPrincipal ? (
                                  <Image
                                    source={{ uri: perro.fotoPrincipal }}
                                    style={styles.nuevoAvatarImage}
                                  />
                                ) : (
                                  <View style={styles.nuevoIconFallback}>
                                    <MaterialIcons name="pets" size={32} color="#34C759" />
                                  </View>
                                )}
                              </View>
                            </View>
                            {nuevo && (
                              <View style={styles.badgeNuevo}>
                                <Text style={styles.badgeNuevoText}>NUEVO</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.nuevoNombre} numberOfLines={1}>
                            {perro.nombre || 'Perro'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </>
              )}
              {conMensajes.length > 0 && (
                <Text style={[styles.sectionHeader, hayNuevos && { marginTop: 8 }]}>
                  Mensajes
                </Text>
              )}
            </>
          }
          ListFooterComponent={
            conMensajes.length === 0 && hayNuevos ? (
              <View style={styles.emptyConvContainer}>
                <MaterialIcons name="chat-bubble-outline" size={48} color="#444" />
                <Text style={styles.emptyConvTitle}>
                  ¡Tienes {sinMensajes.length} match{sinMensajes.length !== 1 ? 'es' : ''}!
                </Text>
                <Text style={styles.emptyConvText}>Di hola 🐾</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#34C759"
              colors={['#34C759']}
            />
          }
          renderItem={({ item }) => {
            const perro = item.perro || {};
            const noLeidos = item.mensajesNoLeidos > 0;
            return (
              <Pressable
                style={styles.convCard}
                onPress={() => abrirChat(item)}
                onLongPress={() => eliminarMatch(item.id)}
              >
                <View style={styles.convAvatarBox}>
                  {perro.fotoPrincipal ? (
                    <Image
                      source={{ uri: perro.fotoPrincipal }}
                      style={styles.convAvatarImage}
                    />
                  ) : (
                    <View style={styles.convIconFallback}>
                      <MaterialIcons name="pets" size={28} color="#34C759" />
                    </View>
                  )}
                  {noLeidos && <View style={styles.convNoLeidoDot} />}
                </View>

                <View style={styles.convContent}>
                  <View style={styles.convTopRow}>
                    <Text
                      style={[styles.convNombre, noLeidos && styles.convNombreNoLeido]}
                      numberOfLines={1}
                    >
                      {perro.nombre || 'Perro'}
                    </Text>
                    <Text style={styles.convTimestamp}>
                      {tiempoRelativo(item.ultimoMensajeFecha)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.convPreview, noLeidos && styles.convPreviewNoLeido]}
                    numberOfLines={1}
                  >
                    {item.ultimoMensaje || 'Sin mensajes aún'}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Estilos ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 12,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 24,
  },

  // ── Section Headers ──
  sectionHeader: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },

  // ── Nuevos Matches (horizontal scroll) ──
  nuevosScroll: {
    paddingBottom: 8,
    flexDirection: 'row',
  },
  nuevoCard: {
    alignItems: 'center',
    width: 88,
    marginRight: 14,
  },
  nuevoAvatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  nuevoAvatarBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
  },
  nuevoAvatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  nuevoAvatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    resizeMode: 'cover',
  },
  nuevoIconFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNuevo: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeNuevoText: {
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  nuevoNombre: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── Conversaciones ──
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    marginBottom: 8,
  },
  convAvatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  convAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'cover',
  },
  convIconFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  convNoLeidoDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#1C1C1C',
  },
  convContent: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convNombre: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  convNombreNoLeido: {
    fontWeight: '800',
  },
  convTimestamp: {
    color: '#666',
    fontSize: 12,
  },
  convPreview: {
    color: '#888',
    fontSize: 13,
  },
  convPreviewNoLeido: {
    color: '#ccc',
    fontWeight: '600',
  },

  // ── Estados vacíos ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyConvContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyConvTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyConvText: {
    color: '#888',
    fontSize: 14,
  },
});
