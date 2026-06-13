import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator,
  Image, RefreshControl, Animated, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { apiWithRefresh } from '../api/client';
import PerfilMatchModal from '../components/PerfilMatchModal';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';

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
  const [perfilVisible, setPerfilVisible] = useState(false);
  const [perfilMatchData, setPerfilMatchData] = useState(null);
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

  useFocusEffect(
    useCallback(() => {
      cargarMatches();
    }, [cargarMatches])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarMatches();
  }, [cargarMatches]);

  const verPerfilMatch = useCallback((match) => {
    setPerfilMatchData(match);
    setPerfilVisible(true);
  }, []);

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
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando matches...</Text>
        </View>
      </View>
    );
  }

  // ── Vacío ──
  if (matches.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>🐾 Mis Matches</Text>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="favorite-border" size={50} color={colors.border} />
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
                                    <MaterialIcons name="pets" size={28} color={colors.primary} />
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
                <Text style={[styles.sectionHeader, hayNuevos && { marginTop: spacing.sm }]}>
                  Mensajes
                </Text>
              )}
            </>
          }
          ListFooterComponent={
            conMensajes.length === 0 && hayNuevos ? (
              <View style={styles.emptyConvContainer}>
                <MaterialIcons name="chat-bubble-outline" size={40} color={colors.border} />
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
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const perro = item.perro || {};
            const noLeidos = item.mensajesNoLeidos > 0;
            return (
              <Pressable
                style={styles.convCard}
                onLongPress={() => eliminarMatch(item.id)}
              >
                <Pressable style={styles.convAvatarBox} onPress={() => verPerfilMatch(item)}>
                  {perro.fotoPrincipal ? (
                    <Image
                      source={{ uri: perro.fotoPrincipal }}
                      style={styles.convAvatarImage}
                    />
                  ) : (
                    <View style={styles.convIconFallback}>
                      <MaterialIcons name="pets" size={24} color={colors.primary} />
                    </View>
                  )}
                  {noLeidos && <View style={styles.convNoLeidoDot} />}
                </Pressable>

                <Pressable style={styles.convContent} onPress={() => abrirChat(item)}>
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
                </Pressable>
              </Pressable>
            );
          }}
        />
      </Animated.View>

      <PerfilMatchModal
        visible={perfilVisible}
        perro={perfilMatchData?.perro}
        onCerrar={() => setPerfilVisible(false)}
        onAbrirChat={() => {
          if (perfilMatchData) abrirChat(perfilMatchData);
        }}
      />
    </View>
  );
}

// ─── Estilos ────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.md,
  },
  loadingText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 24,
  },

  // ── Section Headers ──
  sectionHeader: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },

  // ── Nuevos Matches (horizontal scroll) ──
  nuevosScroll: {
    paddingBottom: spacing.sm,
    flexDirection: 'row',
  },
  nuevoCard: {
    alignItems: 'center',
    width: 90,
    marginRight: spacing.lg,
  },
  nuevoAvatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  nuevoAvatarBorder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    ...shadows.sm,
  },
  nuevoAvatarBox: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  nuevoAvatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    resizeMode: 'cover',
  },
  nuevoIconFallback: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNuevo: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    ...shadows.sm,
  },
  badgeNuevoText: {
    color: colors.textWhite,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  nuevoNombre: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── Conversaciones ──
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  convAvatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
    backgroundColor: colors.borderLight,
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
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.bgCard,
  },
  convContent: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  convNombre: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  convNombreNoLeido: {
    fontWeight: '800',
    color: colors.primaryDark,
  },
  convTimestamp: {
    color: colors.textMuted,
    fontSize: 12,
  },
  convPreview: {
    color: colors.textLight,
    fontSize: 13,
    marginTop: 1,
  },
  convPreviewNoLeido: {
    color: colors.text,
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
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyConvContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyConvTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyConvText: {
    color: colors.textLight,
    fontSize: 14,
  },
});
