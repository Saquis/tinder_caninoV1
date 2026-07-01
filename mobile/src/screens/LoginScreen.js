import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert,
  ActivityIndicator, Animated, Easing, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api, saveTokens } from '../api/client';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AnimatedDog from '../components/AnimatedDog';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();
import { colors, spacing, radius, shadows, typography } from '../styles/theme';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Auth — siempre pasa un string al hook para evitar crash con null
  const googleClientId = Constants.expoConfig?.extra?.googleClientId || 'NO_CONFIGURED';
  const hasGoogleConfig = googleClientId !== 'NO_CONFIGURED';
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    responseType: 'id_token',
  });

  // Procesar respuesta de Google
  useEffect(() => {
    if (googleResponse?.type === 'success' && googleResponse?.params?.id_token) {
      handleGoogleToken(googleResponse.params.id_token);
    }
  }, [googleResponse]);

  const handleGoogleToken = async (idToken) => {
    setGoogleLoading(true);
    try {
      const data = await api('POST', '/auth/google', { idToken });
      if (data.accessToken) {
        await saveTokens(data.accessToken, data.refreshToken);
        onLogin(data.tienePerro);
      }
    } catch (error) {
      const msg = error?.error?.message || error?.message || 'Error al iniciar sesión con Google';
      Alert.alert('Error', msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGooglePress = () => {
    if (!hasGoogleConfig) {
      Alert.alert(
        'Google pendiente',
        'El login con Google necesita configuración. Agrega GOOGLE_CLIENT_ID en app.json extra.'
      );
      return;
    }
    if (googleLoading) return;
    googlePromptAsync({ useProxy: true }).catch(err => {
      console.error('[Google] Error al abrir auth:', err);
      Alert.alert('Error', 'No se pudo abrir la pantalla de Google');
    });
  };

  // Animaciones
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    // Logo aparece después del perro
    Animated.sequence([
      Animated.delay(800),
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      // Formulario sube
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulso continuo del botón
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.sin,
          useNativeDriver: true,
        }),
      ])
    );
    setTimeout(() => pulse.start(), 2000);
  }, []);

  const handleLogin = async () => {
    console.log('[Login] handleLogin iniciado');
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Ingresa un correo válido');
      return;
    }

    setLoading(true);
    try {
      const data = await api('POST', '/auth/login', {
        email: email.trim(),
        password,
      });
      console.log('[Login] Respuesta backend:', JSON.stringify({ tienePerro: data.tienePerro }));
      await saveTokens(data.accessToken, data.refreshToken);
      console.log('[Login] Llamando onLogin con', data.tienePerro);
      if (onLogin) await onLogin();
    } catch (error) {
      const msg = typeof error === 'string' ? error : error?.error?.message || error.message || error.mensaje || error.error || 'Error al iniciar sesión';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Perro animado SVG */}
        <View style={styles.dogWrap}>
          <AnimatedDog size={120} />
        </View>

        {/* Marca */}
        <Animated.View style={{ opacity: logoAnim, transform: [{ scale: logoAnim }], alignItems: 'center' }}>
          <Text style={styles.brandName}>TinderCanino</Text>
          <Text style={styles.brandSub}>Encuentra el mejor amigo para tu perro</Text>
        </Animated.View>

        {/* Card de login */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: formAnim,
              transform: [{
                translateY: formAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                })
              }],
            }
          ]}
        >
          <Text style={styles.cardTitle}>¡Bienvenido de vuelta! 🐾</Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" size={18} color={colors.accent} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={18} color={colors.accent} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <FontAwesome
                name={showPassword ? 'eye' : 'eye-slash'}
                size={18}
                color={colors.accent}
              />
            </Pressable>
          </View>

          {/* Botón Login con pulso */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <View style={styles.buttonRow}>
                  <Text style={styles.boneIcon}>🦴</Text>
                  <Text style={styles.loginBtnText}>Ingresar</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <Pressable
            style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed, googleLoading && { opacity: 0.5 }]}
            onPress={handleGooglePress}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <FontAwesome name="google" size={18} color={colors.text} />
            )}
            <Text style={styles.googleBtnText}>Google</Text>
          </Pressable>
        </Animated.View>

        {/* Register */}
        <Animated.View style={{ opacity: formAnim }}>
          <Pressable onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
            <Text style={styles.registerText}>
              ¿Nuevo por aquí?{' '}
              <Text style={styles.registerLink}>Crea tu cuenta 🐶</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
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
  dogWrap: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brandName: {
    fontFamily: 'sans-serif',
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  brandSub: {
    fontSize: 13,
    color: colors.accentDark,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingLeft: spacing.md,
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
  loginBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    ...shadows.sm,
  },
  loginBtnPressed: {
    backgroundColor: colors.primaryDark,
  },
  loginBtnText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  boneIcon: {
    fontSize: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    marginHorizontal: spacing.sm,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    gap: spacing.sm,
  },
  googleBtnPressed: {
    backgroundColor: colors.gradientMid,
    borderColor: colors.accent,
  },
  googleBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  registerRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 13,
    color: colors.accentDark,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
