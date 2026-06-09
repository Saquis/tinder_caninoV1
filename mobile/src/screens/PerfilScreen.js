import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Switch, Image
} from 'react-native';
import { api, apiUpload, getToken } from '../api/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function PerfilScreen({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perro, setPerro] = useState(null);
  const [perroId, setPerroId] = useState(null);

  // Campos editables
  const [nombre, setNombre] = useState('');
  const [raza, setRaza] = useState('');
  const [edadTexto, setEdadTexto] = useState('');
  const [sexo, setSexo] = useState(null);
  const [castrado, setCastrado] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [proposito, setProposito] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);

  const propositos = [
    { key: 'jugar', label: 'Jugar', icon: 'sports-esports' },
    { key: 'pasear', label: 'Pasear', icon: 'directions-walk' },
    { key: 'reproduccion', label: 'Reproducción', icon: 'favorite' },
    { key: 'todo', label: 'Todo', icon: 'stars' },
  ];

  useEffect(() => {
    console.log('[Perfil] Montado, cargando datos...');
    (async () => {
      try {
        const data = await api('GET', '/perros/mi-perro');
        console.log('[Perfil] Datos cargados:', JSON.stringify(data).slice(0, 150));
        setPerro(data);
        setPerroId(data.id);
        setNombre(data.nombre || '');
        setRaza(data.raza || '');
        setEdadTexto(data.edadMeses ? String(data.edadMeses) : '');
        setSexo(data.sexo || null);
        setCastrado(data.castrado || false);
        setDescripcion(data.descripcion || '');
        setProposito(data.proposito || null);
        if (data.fotoPrincipal) setFotoUri(data.fotoPrincipal);
      } catch (err) {
        console.log('[Perfil] Error al cargar:', JSON.stringify(err).slice(0, 200));
        Alert.alert('Error', 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

    setSaving(true);
    console.log('[Perfil] Guardando cambios...');
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

      // Si hay foto nueva, subirla
      if (fotoBase64) {
        console.log('[Perfil] Subiendo foto nueva...');
        const formData = new FormData();
        const filename = fotoUri.split('/').pop() || 'foto.jpg';
        formData.append('foto', {
          uri: fotoUri,
          type: 'image/jpeg',
          name: filename,
        });

        const fotoRes = await apiUpload('POST', '/perros/' + perroId + '/fotos', formData);
        console.log('[Perfil] Foto subida:', JSON.stringify(fotoRes).slice(0, 100));
      }

      Alert.alert('Guardado', 'Perfil actualizado correctamente');
    } catch (error) {
      console.log('[Perfil] ERROR:', JSON.stringify(error).slice(0, 200));
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi Perfil</Text>

      {/* Foto */}
      <Pressable style={styles.fotoButton} onPress={seleccionarFoto}>
        {fotoUri ? (
          <Image
            source={{ uri: fotoUri }}
            style={styles.fotoPreview}
          />
        ) : (
          <MaterialIcons name="add-a-photo" size={32} color="#34C759" />
        )}
        <Text style={styles.fotoText}>
          {fotoBase64 || (perro?.fotoPrincipal && !fotoBase64) ? 'Cambiar foto' : 'Agregar foto'}
        </Text>
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
      <Text style={styles.label}>Sexo</Text>
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
      <Text style={styles.label}>Propósito</Text>
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

      {/* Botón guardar */}
      <Pressable
        style={({ pressed }) => [styles.guardarButton, pressed && { opacity: 0.8 }]}
        onPress={handleGuardar}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.guardarRow}>
            <FontAwesome name="save" size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.guardarText}>Guardar Cambios</Text>
          </View>
        )}
      </Pressable>

      {/* Cerrar sesión */}
      <Pressable
        style={styles.logoutButton}
        onPress={onLogout}
      >
        <MaterialIcons name="logout" size={18} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
  },
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
    marginTop: 60,
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
  guardarButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
