// PerfilScreen — Galería de fotos + Edición de perfil
import React, { useState, useEffect } from 'react';
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
  const [eliminandoPerfil, setEliminandoPerfil] = useState(false);
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);

  const propositos = [
    { key: 'jugar', label: 'Jugar', icon: 'sports-esports' },
    { key: 'pasear', label: 'Pasear', icon: 'directions-walk' },
    { key: 'reproduccion', label: 'Reproducción', icon: 'favorite' },
    { key: 'todo', label: 'Todo', icon: 'stars' },
  ];

  useEffect(() => {
    console.log('[Perfil] Montado, cargando datos...');
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const data = await api('GET', '/perros/mi-perro');
      console.log('[Perfil] Datos cargados, fotos:', data.fotos?.length || 0);
      setPerro(data);
      setPerroId(data.id);
      setNombre(data.nombre || '');
      setRaza(data.raza || '');
      setEdadTexto(data.edadMeses ? String(data.edadMeses) : '');
      setSexo(data.sexo || null);
      setCastrado(data.castrado || false);
      setDescripcion(data.descripcion || '');
      setProposito(data.proposito || null);
      setFotoPrincipal(data.fotoPrincipal || null);
      setFotos(data.fotos || []);
    } catch (err) {
      console.log('[Perfil] Error al cargar:', JSON.stringify(err).slice(0, 200));
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
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

      {/* Eliminar perfil */}
      <Text style={styles.deleteSectionTitle}>🗑️ Zona de peligro</Text>

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && { opacity: 0.8 },
          eliminandoPerfil && { opacity: 0.5 },
        ]}
        onPress={() => {
          Alert.alert(
            'Eliminar perfil de ' + (perro?.nombre || 'tu perro'),
            'Se borrarán todas sus fotos. Esta acción no se puede deshacer.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: async () => {
                setEliminandoPerfil(true);
                try {
                  await api('DELETE', '/perros/' + perroId);
                  Alert.alert('Perfil eliminado', 'El perfil de ' + perro?.nombre + ' ha sido eliminado.');
                  setPerro(null);
                  setPerroId(null);
                } catch (error) {
                  const msg = error?.error?.message || error?.message || 'Error al eliminar';
                  Alert.alert('Error', msg);
                } finally {
                  setEliminandoPerfil(false);
                }
              } },
            ]
          );
        }}
        disabled={eliminandoPerfil || !perroId}
      >
        {eliminandoPerfil ? (
          <ActivityIndicator color={colors.error} />
        ) : (
          <>
            <MaterialIcons name="pets-off" size={18} color={colors.error} style={{ marginRight: spacing.sm }} />
            <Text style={styles.deleteButtonText}>Eliminar perfil de {perro?.nombre || 'mi perro'}</Text>
          </>
        )}
      </Pressable>

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
            'Se eliminará tu perfil de perro, fotos, matches y toda tu información. Esta acción no se puede deshacer.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar cuenta',
                style: 'destructive',
                onPress: async () => {
                  setEliminandoCuenta(true);
                  try {
                    await api('DELETE', '/usuarios/me');
                    Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido desactivada.');
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
            <Text style={[styles.deleteButtonText, { color: '#B71C1C' }]}>Eliminar cuenta permanentemente</Text>
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
