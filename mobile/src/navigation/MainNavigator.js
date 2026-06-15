import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SwipeScreen from '../screens/SwipeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../screens/ChatScreen';
import PerfilScreen from '../screens/PerfilScreen';
import MapScreen from '../screens/MapScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import TermsScreen from '../screens/TermsScreen';
import { colors } from '../styles/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PerfilStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilPrincipal">
        {props => <PerfilScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
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
    </Stack.Navigator>
  );
}

function MatchesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MatchesList" component={MatchesScreen} />
      <Stack.Screen
        name="Mensajes"
        component={ChatScreen}
        options={{
          headerShown: true,
          headerTitle: 'Chat',
          headerStyle: { backgroundColor: colors.bgCard },
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Explorar"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="pets" size={24} color={color} />
          ),
        }}
      >
        {props => <SwipeScreen {...props} />}
      </Tab.Screen>

      <Tab.Screen
        name="Mapa"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchesStack}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="favorite" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      >
        {props => <PerfilStack {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
