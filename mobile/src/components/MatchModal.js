// MatchModal — Modal animado de "¡Es un Match!" (TinderCanino)
import React, { useEffect, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, Dimensions, Image
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function MatchModal({ visible, matchData, onCerrar, onAbrirChat }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible || !matchData) return null;

  const perroMatch = matchData.perro || {};
  const perroUsuario = matchData.miPerro || {};

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>

        {/* Botón cerrar */}
        <Pressable style={styles.closeBtn} onPress={onCerrar}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </Pressable>

        {/* Icono */}
        <View style={styles.heartIconContainer}>
          <MaterialIcons name="pets" size={44} color={colors.primary} />
        </View>

        {/* Título */}
        <Text style={styles.title}>¡Es un Match! 🎉</Text>

        {/* Fotos de los perros */}
        <View style={styles.photosRow}>
          <View style={styles.photoBox}>
            {perroUsuario.fotoPrincipal ? (
              <Image source={{ uri: perroUsuario.fotoPrincipal }} style={styles.photo} />
            ) : (
              <MaterialIcons name="pets" size={36} color={colors.textMuted} />
            )}
            <Text style={styles.photoLabel}>Tú</Text>
          </View>

          <View style={styles.heartBadge}>
            <MaterialIcons name="favorite" size={24} color={colors.primary} />
          </View>

          <View style={styles.photoBox}>
            {perroMatch.fotoPrincipal ? (
              <Image source={{ uri: perroMatch.fotoPrincipal }} style={styles.photo} />
            ) : (
              <MaterialIcons name="pets" size={36} color={colors.textMuted} />
            )}
            <Text style={styles.photoLabel}>{perroMatch.nombre || 'Match'}</Text>
          </View>
        </View>

        {/* Texto */}
        <Text style={styles.subtitle}>
          A {perroMatch.nombre || 'tu nuevo amigo'} también le gustó tu perro
        </Text>

        {/* Botones */}
        <Pressable
          style={({ pressed }) => [styles.chatBtn, pressed && { opacity: 0.85 }]}
          onPress={onAbrirChat}
        >
          <MaterialIcons name="chat" size={18} color={colors.textWhite} />
          <Text style={styles.chatBtnText}>Enviar mensaje</Text>
        </Pressable>

        <Pressable style={styles.seguirBtn} onPress={onCerrar}>
          <Text style={styles.seguirBtnText}>Seguir viendo</Text>
        </Pressable>

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(61, 43, 26, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    width: width * 0.85,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: spacing.sm,
    zIndex: 10,
  },
  heartIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  heartBadge: {
    marginHorizontal: spacing.md,
  },
  photoLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  chatBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: 28,
    borderRadius: radius.full,
    width: '100%',
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  chatBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  seguirBtn: {
    paddingVertical: spacing.sm,
  },
  seguirBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
