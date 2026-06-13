import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Switch, Image
} from 'react-native';
import { api, apiUpload } from '../api/client';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';

export default function CrearPerfilPerroScreen({ navigation, onCompletado, onLogout }) {
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edadTexto, setEdadTexto] = useState('');
  const [sexo, setSexo] = useState(null);
  const [castrado, setCastrado] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [proposito, setProposito] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);

  const propositos = [
    { key: 'jugar', label: 'Jugar', icon: 'sports-esports' },
    { key: 'pasear', label: 'Pasear', icon: 'directions-walk' },
    { key: 'reproduccion', label: 'Reproducción', icon: 'favorite' },
    { key: 'todo', label: 'Todo', icon: 'stars' },
  ];

  const obtenerUbicacion = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para encontrar perros cerca');
        setLocating(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      Alert.alert('Ubicación obtenida', 'Se usará para mostrar perros cercanos');
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLocating(false);
    }
  };

  const seleccionarFoto = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFotoUri(asset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del perro es obligatorio');
      return;
    }
    if (!sexo) {
      Alert.alert('Error', 'Selecciona el sexo de tu perro');
      return;
    }
    if (!proposito) {
      Alert.alert('Error', 'Selecciona el propósito de tu perro');
      return;
    }

    setLoading(true);
    console.log('[CrearPerfil] Iniciando guardado, fotoUri:', !!fotoUri, 'ubicacion:', !!ubicacion);
    try {
      if (fotoUri) {
        console.log('[CrearPerfil] Enviando con foto (multipart)');
        const formData = new FormData();
        formData.append('nombre', nombre.trim());
        if (raza.trim()) formData.append('raza', raza.trim());
        if (edadTexto) formData.append('edadMeses', edadTexto);
        formData.append('sexo', sexo);
        formData.append('castrado', castrado ? 'true' : 'false');
        if (descripcion.trim()) formData.append('descripcion', descripcion.trim());
        formData.append('proposito', proposito);
        if (ubicacion) {
          formData.append('latitud', String(ubicacion.lat));
          formData.append('longitud', String(ubicacion.lng));
        }
        const filename = fotoUri.split('/').pop() || 'foto.jpg';
        formData.append('foto', {
          uri: fotoUri,
          type: 'image/jpeg',
          name: filename,
        });

        console.log('[CrearPerfil] Llamando apiUpload...');
        const res = await apiUpload('POST', '/perros', formData);
        console.log('[CrearPerfil] apiUpload respuesta:', JSON.stringify(res).slice(0, 100));
      } else {
        console.log('[CrearPerfil] Enviando sin foto (JSON)');
        const body = {
          nombre: nombre.trim(),
          raza: raza.trim() || undefined,
          edadMeses: edadTexto ? parseInt(edadTexto, 10) : undefined,
          sexo,
          castrado,
          descripcion: descripcion.trim() || undefined,
          proposito,
        };
        if (ubicacion) {
          body.latitud = ubicacion.lat;
          body.longitud = ubicacion.lng;
        }
        const res = await api('POST', '/perros', body);
        console.log('[CrearPerfil] api respuesta:', JSON.stringify(res).slice(0, 100));
      }

      console.log('[CrearPerfil] Éxito, llamando onCompletado...');
      if (onCompletado) onCompletado();
    } catch (error) {
      console.log('[CrearPerfil] ERROR:', JSON.stringify(error).slice(0, 200));
      const msg = typeof error === 'string' ? error
        : error.message || error.mensaje
        || (typeof error.error === 'string' ? error.error : error.error?.message || error.error?.mensaje)
        || 'Error al crear perfil';
      console.log('[CrearPerfil] msg para Alert:', msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      console.log('[CrearPerfil] Finalizado');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botón cerrar sesión */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={styles.logoutBtn}
          onPress={() => {
            if (onLogout) onLogout();
          }}
        >
          <MaterialIcons name="logout" size={18} color={colors.error} />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>🐾 Crea el perfil</Text>
      <Text style={styles.subtitle}>Cuéntanos sobre tu compañero</Text>

      {/* Botón de foto */}
      <Pressable style={styles.fotoButton} onPress={seleccionarFoto}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
        ) : (
          <View style={styles.fotoPlaceholderIcon}>
            <MaterialIcons name="pets" size={36} color={colors.accent} />
          </View>
        )}
        <Text style={styles.fotoText}>{fotoUri ? 'Cambiar foto' : 'Agregar foto'}</Text>
      </Pressable>

      {/* Nombre */}
      <Text style={styles.label}>Nombre del perro *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Max, Luna, Toby"
        placeholderTextColor={colors.textMuted}
        value={nombre}
        onChangeText={setNombre}
      />

      {/* Raza */}
      <Text style={styles.label}>Raza</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Labrador, Pastor Alemán"
        placeholderTextColor={colors.textMuted}
        value={raza}
        onChangeText={setRaza}
      />

      {/* Edad */}
      <Text style={styles.label}>Edad (meses)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 24 (2 años)"
        placeholderTextColor={colors.textMuted}
        value={edadTexto}
        onChangeText={setEdadTexto}
        keyboardType="number-pad"
      />

      {/* Sexo */}
      <Text style={styles.label}>Sexo *</Text>
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

      {/* Castrado */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Castrado/Esterilizado</Text>
        <Switch
          value={castrado}
          onValueChange={setCastrado}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={castrado ? colors.primary : colors.textMuted}
        />
      </View>

      {/* Propósito */}
      <Text style={styles.label}>Propósito *</Text>
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

      {/* Descripción */}
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

      {/* Ubicación */}
      <Pressable
        style={[styles.locationButton, ubicacion && styles.locationSet]}
        onPress={obtenerUbicacion}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <MaterialIcons name="my-location" size={20} color={ubicacion ? colors.primary : colors.textMuted} />
        )}
        <Text style={[styles.locationText, ubicacion && styles.locationTextSet]}>
          {ubicacion ? '📍 Ubicación obtenida' : 'Obtener ubicación'}
        </Text>
      </Pressable>

      {/* Botón guardar */}
      <Pressable
        style={({ pressed }) => [styles.guardarButton, pressed && { opacity: 0.85 }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.textWhite} />
        ) : (
          <View style={styles.guardarRow}>
            <FontAwesome name="save" size={16} color={colors.textWhite} style={{ marginRight: spacing.sm }} />
            <Text style={styles.guardarText}>Guardar Perfil</Text>
          </View>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
  },
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
    marginBottom: 28,
    ...shadows.sm,
  },
  fotoPlaceholderIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fotoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
    marginBottom: spacing.sm,
  },
  fotoText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
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
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: 24,
  },
  locationSet: {
    borderColor: colors.primary,
  },
  locationText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  locationTextSet: {
    color: colors.primary,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginBottom: spacing.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  logoutBtnText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  guardarButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
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
});
