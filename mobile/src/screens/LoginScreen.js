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

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        colors={['#FFF8F0', '#F5E8D8', '#FFF8F0']}
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
            <MaterialIcons name="email" size={18} color="#C4A882" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor="#C4A882"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={18} color="#C4A882" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#C4A882"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <FontAwesome
                name={showPassword ? 'eye' : 'eye-slash'}
                size={18}
                color="#C4A882"
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
                <ActivityIndicator color="white" />
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
            style={({ pressed }) => [styles.googleBtn, pressed && styles.googleBtnPressed]}
            onPress={() => Alert.alert('Próximamente', 'Login con Google disponible pronto')}
          >
            <FontAwesome name="google" size={18} color="#3D2B1A" />
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
    backgroundColor: '#FFF8F0',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  dogWrap: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontFamily: 'sans-serif',
    fontSize: 30,
    fontWeight: '800',
    color: '#C4622D',
    letterSpacing: 1,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 13,
    color: '#A07850',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#E0CAB4',
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D2B1A',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A07850',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E0CAB4',
    paddingLeft: 14,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#3D2B1A',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 10,
  },
  loginBtn: {
    backgroundColor: '#C4622D',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginBtnPressed: {
    backgroundColor: '#A8501F',
  },
  loginBtnText: {
    color: '#fff',
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
    gap: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0CAB4',
  },
  dividerText: {
    fontSize: 12,
    color: '#C4A882',
    fontWeight: '600',
    marginHorizontal: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0CAB4',
    backgroundColor: '#FFF8F0',
    gap: 8,
  },
  googleBtnPressed: {
    backgroundColor: '#F5E8D8',
    borderColor: '#C4A882',
  },
  googleBtnText: {
    color: '#3D2B1A',
    fontSize: 14,
    fontWeight: '700',
  },
  registerRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 13,
    color: '#A07850',
  },
  registerLink: {
    color: '#C4622D',
    fontWeight: '700',
  },
});
