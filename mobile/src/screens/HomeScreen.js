import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen({ navigation, onLogout }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 TinderCanino</Text>
      <Text style={styles.subtitle}>Busca compañeros para tu perro</Text>

      <View style={styles.card}>
        <MaterialIcons name="pets" size={50} color="#34C759" />
        <Text style={styles.cardTitle}>Explorar</Text>
        <Text style={styles.cardText}>
          Aquí aparecerán los perros{'\n'}cerca de ti para hacer match
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        activeOpacity={0.7}
      >
        <MaterialIcons name="logout" size={18} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 40,
    width: '100%',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  cardText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
