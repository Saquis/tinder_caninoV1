// PerfilScreen — Galería de fotos + Edición de perfil
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Switch, Image, FlatList
} from 'react-native';
import { api, apiUpload, apiWithRefresh } from '../api/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

export default function PerfilScreen({ onLogout, navigation }) {
  const nav = navigation || useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [perro, setPerro] = useState(null);
  const [perroId, setPerroId] = useState(null);
  const [perrosList, setPerrosList] = useState([]);
  const [perroIndex, setPerroIndex] = useState(0);

  // Campos del perfil
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edadTexto, setEdadTexto] = useState('');
  const [sexo, setSexo] = useState(null);
  const [castrado, setCastrado] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [proposito, setProposito] = useState(null);
  const [fotoPrincipal, setFotoPrincipal] = useState(null);

  // Galería de fotos
  const [fotos, setFotos] = useState([]);

  // Estado de eliminación
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);

  const propositos = [
    { key: 'jugar', label: 'Jugar', icon: 'sports-esports' },
    { key: 'pasear', label: 'Pasear', icon: 'directions-walk' },
    { key: 'reproduccion', label: 'Reproducción', icon: 'favorite' },
    { key: 'todo', label: 'Todo', icon: 'stars' },
  ];

  // Recargar al ganar foco (vuelta de CrearPerfilPerro, etc.)
  useFocusEffect(
    useCallback(() => {
      console.log('[Perfil] Focus, cargando datos...');
      cargarPerfil();
    }, [])
  );

  const llenarFormulario = (perroData) => {
    if (!perroData) return;
    setPerro(perroData);
    setPerroId(perroData.id);
    setNombre(perroData.nombre || '');
    setRaza(perroData.raza || '');
    setEdadTexto(perroData.edadMeses ? String(perroData.edadMeses) : '');
    setSexo(perroData.sexo || null);
    setCastrado(perroData.castrado || false);
    setDescripcion(perroData.descripcion || '');
    setProposito(perroData.proposito || null);
    setFotoPrincipal(perroData.fotoPrincipal || null);
    setFotos(perroData.fotos || []);
  };

  const cargarPerfil = async () => {
    try {
      const data = await api('GET', '/perros/mis-perros');
      console.log('[Perfil] Perros cargados:', data.perros?.length || 0);
      setPerrosList(data.perros || []);
      if (data.perros && data.perros.length > 0) {
        setPerroIndex(0);
        llenarFormulario(data.perros[0]);
      }
    } catch (err) {
      console.log('[Perfil] Error al cargar:', JSON.stringify(err).slice(0, 200));
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPerro = (idx) => {
    if (perrosList[idx]) {
      setPerroIndex(idx);
      llenarFormulario(perrosList[idx]);
    }
  };

  const seleccionarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await subirFotoNueva(asset.uri);
      }
    } catch (error) {
      console.log('[Perfil] Error al seleccionar foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    }
  };

  const subirFotoNueva = async (uri) => {
    setSubiendoFoto(true);
    console.log('[Perfil] Subiendo foto nueva:', uri.slice(0, 50));
    try {
      const formData = new FormData();
      formData.append('foto', {
        uri,
        type: 'image/jpeg',
        name: 'foto_' + Date.now() + '.jpg',
      });

      const res = await apiUpload('POST', '/perros/' + perroId + '/fotos', formData);
      console.log('[Perfil] Foto subida:', JSON.stringify(res).slice(0, 100));

      // Recargar perfil para obtener las fotos actualizadas
      await cargarPerfil();
    } catch (error) {
      console.log('[Perfil] Error al subir foto:', JSON.stringify(error).slice(0, 200));
      const msg = typeof error === 'string' ? error
        : error.message || error.error?.message || error.error || 'Error al subir foto';
      Alert.alert('Error', msg);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const eliminarFoto = (fotoPath, esPrincipal) => {
    console.log('[Perfil] eliminarFoto:', fotoPath, 'esPrincipal:', esPrincipal);
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            console.log('[Perfil] Confirmado eliminar:', fotoPath);
            try {
              const res = await apiWithRefresh('DELETE', `/perros/${perroId}/fotos/${fotoPath}`);
              console.log('[Perfil] Foto eliminada, restantes:', res.fotosRestantes);
              await cargarPerfil();
            } catch (error) {
              console.log('[Perfil] Error al eliminar foto:', JSON.stringify(error).slice(0, 200));
              const msg = typeof error === 'string' ? error
                : error.message || error.error?.message || error.error || 'Error al eliminar';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  const establecerPortada = async (fotoPath) => {
    console.log('[Perfil] establecerPortada:', fotoPath);
    try {
      const res = await apiWithRefresh('PUT', `/perros/${perroId}/fotos/${fotoPath}/portada`);
      console.log('[Perfil] Portada actualizada:', res.fotoPrincipal);
      await cargarPerfil();
    } catch (error) {
      console.log('[Perfil] Error al establecer portada:', JSON.stringify(error).slice(0, 200));
      const msg = typeof error === 'string' ? error
        : error.message || error.error?.message || error.error || 'Error al actualizar';
      Alert.alert('Error', msg);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del perro es obligatorio');
      return;
    }

    setSaving(true);
    console.log('[Perfil] Guardando cambios de perfil...');
    try {
      const body = {
        nombre: nombre.trim(),
        raza: raza.trim() || undefined,
        edadMeses: edadTexto ? parseInt(edadTexto, 10) : undefined,
        sexo,
        castrado,
        descripcion: descripcion.trim() || undefined,
        proposito,
      };

      console.log('[Perfil] PUT /perros/' + perroId, JSON.stringify(body));
      const res = await api('PUT', '/perros/' + perroId, body);
      console.log('[Perfil] PUT respuesta:', JSON.stringify(res).slice(0, 100));
      Alert.alert('🐾 Guardado', 'Perfil actualizado correctamente');
    } catch (error) {
      console.log('[Perfil] ERROR al guardar:', JSON.stringify(error).slice(0, 200));
      const msg = typeof error === 'string' ? error
        : error.message || error.mensaje
        || (typeof error.error === 'string' ? error.error : error.error?.message || error.error?.mensaje)
        || 'Error al guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🐾 Mi Perfil</Text>

      {/* ========== SELECTOR DE PERROS ========== */}
      {perrosList.length > 1 && (
        <View style={styles.perroSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {perrosList.map((p, idx) => (
              <Pressable
                key={p.id}
                style={[
                  styles.perroSelectorItem,
                  idx === perroIndex && styles.perroSelectorItemActive,
                ]}
                onPress={() => seleccionarPerro(idx)}
              >
                <View style={styles.perroSelectorAvatar}>
                  {p.fotoPrincipal ? (
                    <Image source={{ uri: p.fotoPrincipal }} style={styles.perroSelectorImg} />
                  ) : (
                    <MaterialIcons name="pets" size={16} color={colors.accent} />
                  )}
                </View>
                <Text
                  style={[
                    styles.perroSelectorName,
                    idx === perroIndex && styles.perroSelectorNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {p.nombre || 'Sin nombre'}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.perroSelectorAdd}
              onPress={() => nav.navigate('CrearPerfilPerro')}
            >
              <MaterialIcons name="add" size={20} color={colors.primary} />
            </Pressable>
          </ScrollView>
        </View>
      )}

      {perrosList.length === 0 && !loading && (
        <View style={styles.sinPerrosContainer}>
          <MaterialIcons name="pets" size={48} color={colors.border} />
          <Text style={styles.sinPerrosText}>No tienes perros registrados</Text>
          <Pressable
            style={styles.sinPerrosBtn}
            onPress={() => nav.navigate('CrearPerfilPerro')}
          >
            <MaterialIcons name="add" size={18} color="#FFF" />
            <Text style={styles.sinPerrosBtnText}>Crear perfil de perro</Text>
          </Pressable>
        </View>
      )}

      {perrosList.length > 0 && (
      <>
      {/* ========== GALERÍA DE FOTOS ========== */}
      <Text style={styles.sectionTitle}>📸 Fotos</Text>

      {fotos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galeriaScroll}>
          {fotos.map((foto, idx) => {
            const esPrincipal = foto.url === fotoPrincipal;
            return (
              <View key={foto.path || idx} style={[styles.fotoCard, esPrincipal && styles.fotoCardPrincipal]}>
                <Image source={{ uri: foto.url }} style={styles.fotoThumb} />
                {esPrincipal && (
                  <View style={styles.portadaBadge}>
                    <MaterialIcons name="star" size={12} color="#FFD700" />
                    <Text style={styles.portadaBadgeText}>Principal</Text>
                  </View>
                )}
                <View style={styles.fotoActions}>
                  {!esPrincipal && (
                    <Pressable
                      style={styles.fotoActionBtn}
                      onPress={() => establecerPortada(foto.path)}
                    >
                      <MaterialIcons name="star-border" size={16} color={colors.primary} />
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.fotoActionBtn, styles.fotoDeleteBtn]}
                    onPress={() => eliminarFoto(foto.path, esPrincipal)}
                  >
                    <MaterialIcons name="delete-outline" size={16} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            );
          })}

          {/* Botón agregar foto */}
          <Pressable style={styles.agregarFotoCard} onPress={seleccionarFoto}>
            {subiendoFoto ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <MaterialIcons name="add-a-photo" size={24} color={colors.primary} />
                <Text style={styles.agregarFotoText}>Agregar</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      ) : (
        <Pressable style={styles.fotoButton} onPress={seleccionarFoto}>
          {subiendoFoto ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <View style={styles.fotoPlaceholder}>
                <MaterialIcons name="pets" size={40} color={colors.accent} />
              </View>
              <Text style={styles.fotoText}>Agregar fotos</Text>
            </>
          )}
        </Pressable>
      )}

      <Text style={styles.ayudaFotos}>
        {fotos.length > 0
          ? 'Toca ⭐ para establecer como principal | 🗑️ para eliminar'
          : 'Agrega fotos de tu perro para que otros usuarios lo conozcan'}
      </Text>

      <View style={styles.divider} />

      {/* ========== INFO DEL PERFIL ========== */}
      <Text style={styles.sectionTitle}>✏️ Información</Text>

      <Text style={styles.label}>Nombre del perro *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Max, Luna, Toby"
        placeholderTextColor={colors.textMuted}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Raza</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Labrador, Pastor Alemán"
        placeholderTextColor={colors.textMuted}
        value={raza}
        onChangeText={setRaza}
      />

      <Text style={styles.label}>Edad (meses)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 24 (2 años)"
        placeholderTextColor={colors.textMuted}
        value={edadTexto}
        onChangeText={setEdadTexto}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Sexo</Text>
      <View style={styles.sexRow}>
        <Pressable
          style={[styles.sexButton, sexo === 'macho' && styles.sexSelected]}
          onPress={() => setSexo('macho')}
        >
          <MaterialIcons name="male" size={22} color={sexo === 'macho' ? colors.primary : colors.textMuted} />
          <Text style={[styles.sexText, sexo === 'macho' && styles.sexTextSelected]}>Macho</Text>
        </Pressable>
        <Pressable
          style={[styles.sexButton, sexo === 'hembra' && styles.sexSelected]}
          onPress={() => setSexo('hembra')}
        >
          <MaterialIcons name="female" size={22} color={sexo === 'hembra' ? colors.primary : colors.textMuted} />
          <Text style={[styles.sexText, sexo === 'hembra' && styles.sexTextSelected]}>Hembra</Text>
        </Pressable>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Castrado/Esterilizado</Text>
        <Switch
          value={castrado}
          onValueChange={setCastrado}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={castrado ? colors.primary : colors.textMuted}
        />
      </View>

      <Text style={styles.label}>Propósito</Text>
      <View style={styles.propositoGrid}>
        {propositos.map(p => (
          <Pressable
            key={p.key}
            style={[styles.propositoCard, proposito === p.key && styles.propositoSelected]}
            onPress={() => setProposito(p.key)}
          >
            <MaterialIcons name={p.icon} size={22} color={proposito === p.key ? colors.primary : colors.textMuted} />
            <Text style={[styles.propositoText, proposito === p.key && styles.propositoTextSelected]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe la personalidad de tu perro..."
        placeholderTextColor={colors.textMuted}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={3}
      />

      {/* Botón guardar */}
      <Pressable
        style={({ pressed }) => [styles.guardarButton, pressed && { opacity: 0.85 }]}
        onPress={handleGuardar}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.textWhite} />
        ) : (
          <View style={styles.guardarRow}>
            <FontAwesome name="save" size={16} color={colors.textWhite} style={{ marginRight: spacing.sm }} />
            <Text style={styles.guardarText}>Guardar Cambios</Text>
          </View>
        )}
      </Pressable>

      {/* Legal links */}
      <View style={styles.legalSection}>
        <Pressable
          style={styles.legalRow}
          onPress={() => nav.navigate('Terms')}
        >
          <MaterialIcons name="description" size={18} color={colors.accent} />
          <Text style={styles.legalRowText}>Términos de Servicio</Text>
          <MaterialIcons name="chevron-right" size={18} color={colors.textLight} />
        </Pressable>
        <Pressable
          style={styles.legalRow}
          onPress={() => nav.navigate('Privacy')}
        >
          <MaterialIcons name="security" size={18} color={colors.accent} />
          <Text style={styles.legalRowText}>Política de Privacidad</Text>
          <MaterialIcons name="chevron-right" size={18} color={colors.textLight} />
        </Pressable>
      </View>

      </>
      )}

      <View style={styles.divider} />

      {/* Cerrar sesión */}
      <Pressable
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Cerrar sesión', style: 'destructive', onPress: onLogout },
            ]
          );
        }}
      >
        <MaterialIcons name="logout" size={18} color={colors.textWhite} style={{ marginRight: spacing.sm }} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </Pressable>

      <View style={styles.divider} />

      {/* Eliminar cuenta (borra perro + fotos + cuenta) */}
      <Text style={styles.deleteSectionTitle}>🗑️ Eliminar todo</Text>

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          styles.deleteCuentaButton,
          pressed && { opacity: 0.8 },
          eliminandoCuenta && { opacity: 0.5 },
        ]}
        onPress={() => {
          Alert.alert(
            'Eliminar cuenta',
            'Se eliminará tu perfil, fotos, matches y toda tu información. Esta acción no se puede deshacer.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar todo',
                style: 'destructive',
                onPress: async () => {
                  setEliminandoCuenta(true);
                  try {
                    await api('DELETE', '/usuarios/me');
                    Alert.alert('Cuenta eliminada', 'Tu cuenta y perfil han sido eliminados.');
                    onLogout();
                  } catch (error) {
                    const msg = error?.error?.message || error?.message || 'Error al eliminar';
                    Alert.alert('Error', msg);
                  } finally {
                    setEliminandoCuenta(false);
                  }
                },
              },
            ]
          );
        }}
        disabled={eliminandoCuenta}
      >
        {eliminandoCuenta ? (
          <ActivityIndicator color="#B71C1C" />
        ) : (
          <>
            <MaterialIcons name="delete-forever" size={18} color="#B71C1C" style={{ marginRight: spacing.sm }} />
            <Text style={[styles.deleteButtonText, { color: '#B71C1C' }]}>Eliminar cuenta y perfil</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.xxl,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentDark,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xxl,
  },

  // ===== SELECTOR DE PERROS =====
  perroSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  perroSelectorItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  perroSelectorItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.bgCard,
  },
  perroSelectorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  perroSelectorImg: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
  },
  perroSelectorName: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
    maxWidth: 70,
    textAlign: 'center',
    fontWeight: '500',
  },
  perroSelectorNameActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  perroSelectorAdd: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  sinPerrosContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  sinPerrosText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    textAlign: 'center',
  },
  sinPerrosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  sinPerrosBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ===== GALERÍA =====
  galeriaScroll: {
    marginBottom: spacing.sm,
  },
  fotoCard: {
    width: 120,
    height: 140,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  fotoCardPrincipal: {
    borderColor: colors.primary,
  },
  fotoThumb: {
    width: '100%',
    height: 90,
    resizeMode: 'cover',
  },
  portadaBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  portadaBadgeText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
  },
  fotoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: 4,
  },
  fotoActionBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoDeleteBtn: {},
  agregarFotoCard: {
    width: 120,
    height: 140,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    gap: spacing.sm,
  },
  agregarFotoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  ayudaFotos: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },

  // ===== FOTO ÚNICA (cuando no hay fotos) =====
  fotoButton: {
    alignSelf: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.sm,
  },
  fotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fotoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  // ===== FORM =====
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sexRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sexSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0E8',
  },
  sexText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  sexTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  propositoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  propositoCard: {
    width: '47%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  propositoSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0E8',
  },
  propositoText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  propositoTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  guardarButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  guardarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardarText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  legalSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  legalRowText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  logoutText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },

  // ===== ZONA DE PELIGRO =====
  deleteSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.error,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.error + '40',
    backgroundColor: '#FFF0F0',
    marginBottom: spacing.md,
  },
  deleteCuentaButton: {
    borderColor: '#B71C1C',
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
});
