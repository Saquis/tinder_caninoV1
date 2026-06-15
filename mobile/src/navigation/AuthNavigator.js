import React, { createContext, useContext, useCallback, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CrearPerfilPerroScreen from '../screens/CrearPerfilPerroScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import { colors } from '../styles/theme';

const Stack = createStackNavigator();

// Contexto para pasar callbacks a las screens
const AuthContext = createContext(null);

// Wrappers estables (definidos fuera del componente, usan Context)
function LoginWrapper(props) {
  const ctx = useContext(AuthContext);
  return <LoginScreen {...props} onLogin={ctx.onLogin} />;
}

function RegisterWrapper(props) {
  const ctx = useContext(AuthContext);
  return <RegisterScreen {...props} onRegister={ctx.onRegister} />;
}

function PerfilWrapper(props) {
  const ctx = useContext(AuthContext);
  return <CrearPerfilPerroScreen {...props} onCompletado={ctx.onCompletado} onLogout={ctx.onLogout} />;
}

export default function AuthNavigator({ onLogin, forceScreen, onLogout }) {
  const initialRoute = forceScreen || 'Login';

  const handlePerfilCompletado = useCallback(() => {
    if (onLogin) onLogin();
  }, [onLogin]);

  const handleRegister = useCallback(async () => {
    if (onLogin) await onLogin();
  }, [onLogin]);

  const contextValue = { onLogin, onLogout, onRegister: handleRegister, onCompletado: handlePerfilCompletado };

  return (
    <AuthContext.Provider value={contextValue}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginWrapper} />
        <Stack.Screen
          name="Register"
          component={RegisterWrapper}
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Volver',
            headerStyle: { backgroundColor: colors.bgCard },
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Terms"
          component={TermsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CrearPerfilPerro"
          component={PerfilWrapper}
          options={{
            headerShown: true,
            headerTitle: 'Tu perro',
            headerStyle: { backgroundColor: colors.bgCard },
            headerTintColor: colors.primary,
            headerLeft: () => null,
          }}
        />
      </Stack.Navigator>
    </AuthContext.Provider>
  );
}
