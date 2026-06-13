import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../api/client';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{6,}$/;

export default function RegisterScreen({ navigation, onRegister }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const handleRegister = async () => {
    if (!nombre.trim() || nombre.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'El correo es obligatorio');
      return;
    }
    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Contraseña débil',
        'Mínimo 6 caracteres, una mayúscula, una minúscula y un número'
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
        email: email.trim().toLowerCase(),
        password,
      });
      await onRegister(data.tienePerro !== undefined ? data.tienePerro : false);
    } catch (error) {
      const msg = typeof error === 'string' ? error
        : error?.error?.message || error?.message || error?.mensaje
        || (typeof error?.error === 'string' ? error.error : 'Error al registrarse');
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Título */}
          <View style={styles.header}>
            <Text style={styles.brandName}>TinderCanino</Text>
            <Text style={styles.brandSub}>Crear cuenta</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Nombre */}
            <Text style={styles.label}>Nombre</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="user" size={16} color={colors.accent} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={colors.textMuted}
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="envelope" size={16} color={colors.accent} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={16} color={colors.accent} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Mín. 6 caracteres"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <MaterialIcons
                  name={showPass ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.accent}
                />
              </Pressable>
            </View>

            {/* Confirmar password */}
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={16} color={colors.accent} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Repite la contraseña"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConf}
              />
              <Pressable onPress={() => setShowConf(!showConf)} style={styles.eyeBtn}>
                <MaterialIcons
                  name={showConf ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.accent}
                />
              </Pressable>
            </View>

            {/* Botón registrar */}
            <Pressable
              style={({ pressed }) => [styles.registerBtn, pressed && styles.registerBtnPressed]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <View style={styles.buttonRow}>
                  <FontAwesome name="user-plus" size={16} color={colors.textWhite} style={{ marginRight: spacing.sm }} />
                  <Text style={styles.registerBtnText}>Crear Cuenta</Text>
                </View>
              )}
            </Pressable>

            {/* Google */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>
            <Pressable
              style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
              onPress={() => Alert.alert('Próximamente', 'Login con Google estará disponible pronto')}
            >
              <FontAwesome name="google" size={18} color={colors.accentDark} />
              <Text style={styles.googleBtnText}>Google</Text>
            </Pressable>
          </View>

          {/* Link a login */}
          <Pressable onPress={() => navigation.goBack()} style={styles.loginLink}>
            <MaterialIcons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.loginLinkText}>Ya tengo cuenta</Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 14,
    color: colors.accentDark,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.xxl,
    ...shadows.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  eyeBtn: {
    padding: spacing.sm,
  },
  registerBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  registerBtnPressed: {
    opacity: 0.85,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    gap: spacing.sm,
  },
  googleBtnPressed: {
    opacity: 0.7,
  },
  googleBtnText: {
    color: colors.accentDark,
    fontSize: 15,
    fontWeight: '600',
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 24,
  },
  loginLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
