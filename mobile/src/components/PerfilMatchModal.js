// PerfilMatchModal — Modal con perfil completo del match (TinderCanino)
import React from 'react';
import {
  View, Text, Modal, Pressable, StyleSheet, Image, ScrollView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows } from '../styles/theme';

export default function PerfilMatchModal({ visible, perro, onCerrar, onAbrirChat }) {
  if (!perro) return null;

  const edadTexto = perro.edadMeses
    ? `${Math.floor(perro.edadMeses / 12)}a ${perro.edadMeses % 12}m`
    : '?';

  const propositoIcons = {
    jugar: 'sports-esports',
    pasear: 'directions-walk',
    reproduccion: 'favorite',
    todo: 'stars',
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.modal}>
            {/* Close */}
            <Pressable style={styles.closeBtn} onPress={onCerrar}>
              <MaterialIcons name="close" size={22} color={colors.text} />
            </Pressable>

            {/* Foto */}
            <View style={styles.fotoBox}>
              {perro.fotoPrincipal ? (
                <Image source={{ uri: perro.fotoPrincipal }} style={styles.foto} />
              ) : (
                <View style={styles.fotoPlaceholder}>
                  <MaterialIcons name="pets" size={56} color={colors.accent} />
                </View>
              )}
            </View>

            {/* Info básica */}
            <Text style={styles.nombre}>{perro.nombre || 'Sin nombre'}</Text>
            <Text style={styles.raza}>{perro.raza || 'Mestizo'} • {edadTexto}</Text>

            {/* Sexo + propósito */}
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <MaterialIcons
                  name={perro.sexo === 'macho' ? 'male' : 'female'}
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.badgeText}>
                  {perro.sexo === 'macho' ? 'Macho' : 'Hembra'}
                </Text>
              </View>
              {perro.proposito && (
                <View style={styles.badge}>
                  <MaterialIcons
                    name={propositoIcons[perro.proposito] || 'pets'}
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.badgeText}>
                    {perro.proposito === 'jugar' ? 'Jugar' :
                     perro.proposito === 'pasear' ? 'Pasear' :
                     perro.proposito === 'reproduccion' ? 'Reproducción' : 'Todo'}
                  </Text>
                </View>
              )}
              {perro.castrado && (
                <View style={styles.badge}>
                  <MaterialIcons name="check-circle" size={16} color={colors.primary} />
                  <Text style={styles.badgeText}>Esterilizado</Text>
                </View>
              )}
            </View>

            {/* Descripción */}
            {perro.descripcion && (
              <View style={styles.descBox}>
                <Text style={styles.descLabel}>Sobre {perro.nombre || 'él/ella'}</Text>
                <Text style={styles.descTexto}>{perro.descripcion}</Text>
              </View>
            )}

            {/* Botón abrir chat */}
            <Pressable
              style={({ pressed }) => [styles.chatBtn, pressed && { opacity: 0.85 }]}
              onPress={() => { onCerrar(); onAbrirChat(); }}
            >
              <MaterialIcons name="chat" size={18} color={colors.textWhite} />
              <Text style={styles.chatBtnText}>Enviar mensaje</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(61, 43, 26, 0.85)',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fotoBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.bgInput,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  foto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fotoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombre: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  raza: {
    fontSize: 15,
    color: colors.textLight,
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  descBox: {
    width: '100%',
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descLabel: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  descTexto: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  chatBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  chatBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});
