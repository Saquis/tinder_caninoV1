import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { api, saveTokens } from '../api/client';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function RegisterScreen({ navigation, onRegister }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{6,}$/;

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Ingresa un correo válido');
      return;
    }
    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Error',
        'La contraseña debe tener al menos 6 caracteres,\nuna mayúscula, una minúscula y un número'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const data = await api('POST', '/auth/registro', {
        nombre: nombre.trim(),
        email: email.trim(),
        password,
      });

      await saveTokens(data.accessToken, data.refreshToken);
      if (onRegister) await onRegister();

    } catch (error) {
      const msg = typeof error === 'string' ? error
        : error.message || error.mensaje
        || (typeof error.error === 'string' ? error.error : error.error?.message || error.error?.mensaje)
        || 'Error al registrarse';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Regístrate y encuentra{'\n'}compañero para tu perro</Text>

      <Text style={styles.label}>Nombre</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="user" size={16} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor="#555"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
      </View>

      <Text style={styles.label}>Correo electrónico</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="envelope" size={16} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="lock" size={16} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Mín. 6 caracteres"
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome
            name={showPassword ? 'eye' : 'eye-slash'}
            size={18}
            color="#777"
            style={{ marginRight: 10 }}
          />
        </Pressable>
      </View>

      <Text style={styles.label}>Confirmar contraseña</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="lock" size={16} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Repite la contraseña"
          placeholderTextColor="#555"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
        />
        <Pressable onPress={() => setShowConfirm(!showConfirm)}>
          <FontAwesome
            name={showConfirm ? 'eye' : 'eye-slash'}
            size={18}
            color="#777"
            style={{ marginRight: 10 }}
          />
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.buttonRow}>
            <FontAwesome name="user-plus" size={16} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          </View>
        )}
      </Pressable>

      <Pressable style={styles.googleBtn} onPress={() => Alert.alert('Próximamente', 'Login con Google disponible pronto')}>
        <FontAwesome name="google" size={18} color="#fff" />
        <Text style={styles.googleBtnText}>Continuar con Google</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.linkRow}
      >
        <FontAwesome name="sign-in" size={14} color="#34C759" style={{ marginRight: 6 }} />
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia Sesión</Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#333',
    paddingLeft: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonPressed: {
    backgroundColor: '#2AA44F',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: '#34C759',
    marginLeft: 6,
    fontSize: 14,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1C1C1C',
    marginBottom: 20,
    gap: 10,
  },
  googleBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
