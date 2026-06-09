import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SwipeScreen from '../screens/SwipeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../screens/ChatScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#34C759',
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
          backgroundColor: '#1C1C1C',
          borderTopColor: '#333',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: '#34C759',
        tabBarInactiveTintColor: '#666',
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
        {props => <PerfilScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

