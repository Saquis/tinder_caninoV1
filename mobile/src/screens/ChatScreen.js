import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { apiWithRefresh } from '../api/client';

export default function ChatScreen({ route, navigation }) {
  const { matchId, perroNombre } = route.params || {};
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    console.log('[Chat] Montado, matchId:', matchId);
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 10000);
    return () => { console.log('[Chat] Desmontado'); clearInterval(interval); };
  }, []);

  const cargarMensajes = async () => {
    try {
      console.log('[Chat] Cargando mensajes para match:', matchId);
      const data = await apiWithRefresh('GET', `/chat/${matchId}`);
      console.log('[Chat] Mensajes recibidos:', data.mensajes?.length || 0);
      setMensajes(data.mensajes || []);
    } catch (error) {
      const msg = typeof error === 'string' ? error : error.message || '';
      if (!msg.includes('401') && !msg.includes('404')) {
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!texto.trim() || enviando) return;
    console.log('[Chat] Enviando mensaje:', texto.trim().slice(0, 50));
    setEnviando(true);
    try {
      const res = await apiWithRefresh('POST', `/chat/${matchId}`, { contenido: texto.trim() });
      console.log('[Chat] Mensaje enviado OK, id:', res.id);
      setTexto('');
      await cargarMensajes();
    } catch (error) {
      console.log('[Chat] Error al enviar:', JSON.stringify(error).slice(0, 200));
      const msg = typeof error === 'string' ? error : error.message || 'Error al enviar';
      Alert.alert('Error', msg);
    } finally {
      setEnviando(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.header}>
        {perroNombre ? `💬 ${perroNombre}` : '💬 Chat'}
      </Text>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item, index) => item.id || index.toString()}
        style={styles.messageList}
        contentContainerStyle={mensajes.length === 0 ? styles.emptyList : styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat" size={50} color="#444" />
            <Text style={styles.emptyTitle}>Sin mensajes</Text>
            <Text style={styles.emptyText}>
              Envía el primer mensaje para iniciar la conversación
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const esMio = item.esPropio || item.propio;
          return (
            <View style={[styles.messageBubble, esMio ? styles.myMessage : styles.theirMessage]}>
              <Text style={[styles.messageText, esMio && styles.myMessageText]}>
                {item.texto}
              </Text>
              <Text style={[styles.messageTime, esMio && styles.myMessageTime]}>
                {formatTime(item.fecha)}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#555"
          value={texto}
          onChangeText={setTexto}
          multiline
          maxLength={500}
        />
        <Pressable
          style={[styles.sendButton, !texto.trim() && styles.sendButtonDisabled]}
          onPress={enviarMensaje}
          disabled={!texto.trim() || enviando}
        >
          <MaterialIcons name="send" size={20} color="white" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  messageList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#34C759',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000',
  },
  messageTime: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: '#1a1a1a',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#0A0A0A',
  },
  input: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    backgroundColor: '#34C759',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
