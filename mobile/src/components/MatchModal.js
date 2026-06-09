// MatchModal — Modal animado de "¡Es un Match!"
// Capa: entry-points/mobile/components

import React, { useEffect, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, Dimensions, Image
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
          <MaterialIcons name="close" size={24} color="#fff" />
        </Pressable>

        {/* Icono */}
        <MaterialIcons name="pets" size={48} color="#34C759" style={styles.icon} />

        {/* Título */}
        <Text style={styles.title}>¡Es un Match! 🎉</Text>

        {/* Fotos de los perros */}
        <View style={styles.photosRow}>
          <View style={styles.photoBox}>
            {perroUsuario.fotoPrincipal ? (
              <Image
                source={{ uri: perroUsuario.fotoPrincipal }}
                style={styles.photo}
              />
            ) : (
              <MaterialIcons name="pets" size={40} color="#555" />
            )}
            <Text style={styles.photoLabel}>Tú</Text>
          </View>

          <MaterialIcons name="favorite" size={28} color="#34C759" style={styles.heartIcon} />

          <View style={styles.photoBox}>
            {perroMatch.fotoPrincipal ? (
              <Image
                source={{ uri: perroMatch.fotoPrincipal }}
                style={styles.photo}
              />
            ) : (
              <MaterialIcons name="pets" size={40} color="#555" />
            )}
            <Text style={styles.photoLabel}>{perroMatch.nombre || 'Match'}</Text>
          </View>
        </View>

        {/* Texto */}
        <Text style={styles.subtitle}>
          A {perroMatch.nombre || 'tu nuevo amigo'} también le gustó tu perro
        </Text>

        {/* Botones */}
        <Pressable style={styles.chatBtn} onPress={onAbrirChat}>
          <MaterialIcons name="chat" size={18} color="#000" />
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    width: width * 0.85,
    backgroundColor: '#1C1C1C',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 20,
    textAlign: 'center',
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#34C759',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  heartIcon: {
    marginHorizontal: 12,
  },
  photoLabel: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  chatBtn: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    width: '100%',
    marginBottom: 12,
    gap: 6,
  },
  chatBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seguirBtn: {
    paddingVertical: 10,
  },
  seguirBtnText: {
    color: '#888',
    fontSize: 14,
  },
});
