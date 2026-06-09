import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Switch, Image
} from 'react-native';
import { api, apiUpload, getToken, saveTokens } from '../api/client';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function CrearPerfilPerroScreen({ navigation, onCompletado, onLogout }) {
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edadTexto, setEdadTexto] = useState('');
  const [sexo, setSexo] = useState(null); // 'macho' | 'hembra'
  const [castrado, setCastrado] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [proposito, setProposito] = useState(null); // 'jugar' | 'pasear' | 'reproduccion' | 'todo'
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [ubicacion, setUbicacion] = useState(null); // { lat, lng }
  const [fotoUri, setFotoUri] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);

  const propositos = [
    { key: 'jugar', label: 'Jugar', icon: 'sports-esports' },
    { key: 'pasear', label: 'Pasear', icon: 'directions-walk' },
    { key: 'reproduccion', label: 'Reproducción', icon: 'favorite' },
    { key: 'todo', label: 'Todo', icon: 'stars' },
  ];

  const obtenerUbicacion = async () => {
    try {
      setLocating(true);
      const { getCurrentPositionAsync, requestForegroundPermissionsAsync } =
        await import('expo-location');

      const { status } = await requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para encontrar perros cerca');
        setLocating(false);
        return;
      }

      const pos = await getCurrentPositionAsync({});
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
      const { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } =
        await import('expo-image-picker');

      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
        return;
      }

      const result = await launchImageLibraryAsync({
        allowsEditing: true,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFotoUri(asset.uri);
        setFotoBase64(asset.base64);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la foto');
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
    console.log('[CrearPerfil] Iniciando guardado, fotoBase64:', !!fotoBase64, 'ubicacion:', !!ubicacion);
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

      if (ubicacion) {
        body.latitud = ubicacion.lat;
        body.longitud = ubicacion.lng;
      }

      let perroId = null;

      if (fotoBase64) {
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
        // Agregar archivo de foto
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
          <MaterialIcons name="logout" size={18} color="#FF3B30" />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Crea el perfil de tu perro</Text>
      <Text style={styles.subtitle}>Cuéntanos sobre tu compañero</Text>

      {/* Botón de foto */}
      <Pressable style={styles.fotoButton} onPress={seleccionarFoto}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
        ) : (
          <MaterialIcons name="add-a-photo" size={32} color="#34C759" />
        )}
        <Text style={styles.fotoText}>{fotoUri ? 'Cambiar foto' : 'Agregar foto'}</Text>
      </Pressable>

      {/* Nombre */}
      <Text style={styles.label}>Nombre del perro *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Max, Luna, Toby"
        placeholderTextColor="#555"
        value={nombre}
        onChangeText={setNombre}
      />

      {/* Raza */}
      <Text style={styles.label}>Raza</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Labrador, Pastor Alemán"
        placeholderTextColor="#555"
        value={raza}
        onChangeText={setRaza}
      />

      {/* Edad */}
      <Text style={styles.label}>Edad (meses)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 24 (2 años)"
        placeholderTextColor="#555"
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
          <MaterialIcons name="male" size={22} color={sexo === 'macho' ? '#34C759' : '#666'} />
          <Text style={[styles.sexText, sexo === 'macho' && styles.sexTextSelected]}>Macho</Text>
        </Pressable>
        <Pressable
          style={[styles.sexButton, sexo === 'hembra' && styles.sexSelected]}
          onPress={() => setSexo('hembra')}
        >
          <MaterialIcons name="female" size={22} color={sexo === 'hembra' ? '#34C759' : '#666'} />
          <Text style={[styles.sexText, sexo === 'hembra' && styles.sexTextSelected]}>Hembra</Text>
        </Pressable>
      </View>

      {/* Castrado */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Castrado/Esterilizado</Text>
        <Switch
          value={castrado}
          onValueChange={setCastrado}
          trackColor={{ false: '#333', true: '#34C759' }}
          thumbColor={castrado ? '#fff' : '#888'}
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
            <MaterialIcons name={p.icon} size={24} color={proposito === p.key ? '#34C759' : '#666'} />
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
        placeholderTextColor="#555"
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
          <ActivityIndicator color="#34C759" />
        ) : (
          <MaterialIcons name="my-location" size={20} color={ubicacion ? '#34C759' : '#888'} />
        )}
        <Text style={[styles.locationText, ubicacion && styles.locationTextSet]}>
          {ubicacion ? '📍 Ubicación obtenida' : 'Obtener ubicación'}
        </Text>
      </Pressable>

      {/* Botón guardar */}
      <Pressable
        style={({ pressed }) => [styles.guardarButton, pressed && { opacity: 0.8 }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.guardarRow}>
            <FontAwesome name="save" size={18} color="white" style={{ marginRight: 8 }} />
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
    backgroundColor: '#000',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 28,
  },
  fotoButton: {
    alignSelf: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  fotoText: {
    color: '#34C759',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  fotoHint: {
    color: '#555',
    fontSize: 10,
    marginTop: 2,
  },
  fotoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sexRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
    gap: 8,
  },
  sexSelected: {
    borderColor: '#34C759',
    backgroundColor: '#1A2E1A',
  },
  sexText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  sexTextSelected: {
    color: '#34C759',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
    marginBottom: 16,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 15,
  },
  propositoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  propositoCard: {
    width: '47%',
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  propositoSelected: {
    borderColor: '#34C759',
    backgroundColor: '#1A2E1A',
  },
  propositoText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  propositoTextSelected: {
    color: '#34C759',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
    gap: 8,
    marginBottom: 24,
  },
  locationSet: {
    borderColor: '#34C759',
  },
  locationText: {
    color: '#888',
    fontSize: 14,
  },
  locationTextSet: {
    color: '#34C759',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 40,
    marginBottom: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    gap: 6,
  },
  logoutBtnText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  guardarButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  guardarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
