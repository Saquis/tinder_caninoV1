import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { loadTokens, clearTokens, api } from './src/api/client';
import CrearPerfilPerroScreen from './src/screens/CrearPerfilPerroScreen';

export default function App() {
  const [screen, setScreen] = useState('splash');

  useEffect(() => {
    console.log('[App] Montado, verificando sesión...');
    (async () => {
      const hasToken = await loadTokens();
      console.log('[App] ¿Token guardado?', hasToken);

      if (!hasToken) {
        console.log('[App] Sin token → auth');
        setScreen('auth');
        return;
      }

      try {
        const perro = await api('GET', '/perros/mi-perro');
        console.log('[App] Perro encontrado:', perro ? perro.id || perro.nombre : 'null');
        setScreen('main');
      } catch (err) {
        console.log('[App] Error al buscar perro:', err?.status, err?.message || err?.error);
        if (err && err.status === 404) {
          console.log('[App] 404 → no tiene perro → newdog');
          setScreen('newdog');
        } else {
          console.log('[App] Otro error → limpiar y auth');
          await clearTokens();
          setScreen('auth');
        }
      }
    })();
  }, []);

  const handleLogin = useCallback(async () => { // Toda esta funciion se llama desde LoginScreen después de guardar los tokens, para verificar si el usuario tiene perro y redirigirlo por claude
  console.log('[App] handleLogin llamado, verificando perro...');
  try {
    const perro = await api('GET', '/perros/mi-perro');
    console.log('[App] Perro encontrado → main');
    setScreen('main');
  } catch (err) {
    console.log('[App] Error perro:', err?.status);
    if (err && err.status === 404) {
      console.log('[App] Sin perro → newdog');
      setScreen('newdog');
    } else {
      setScreen('main');
    }
  }
}, []);

  const handleLogout = useCallback(async () => {
    console.log('[App] handleLogout');
    try { await api('POST', '/auth/logout', {}); } catch (_) {}
    await clearTokens();
    setScreen('auth');
  }, []);

  console.log('[App] Renderizando screen =', screen);

  if (screen === 'splash') return <SplashScreen />;

  return (
    <NavigationContainer>
      {screen === 'auth' && <AuthNavigator key="auth" onLogin={handleLogin} />}
      {screen === 'newdog' && (
        <CrearPerfilPerroScreen
          onCompletado={() => {
            console.log('[App] Perfil creado → main');
            setScreen('main');
          }}
          onLogout={handleLogout}
        />
      )}
      {screen === 'main' && <MainNavigator onLogout={handleLogout} />}
    </NavigationContainer>
  );
}
