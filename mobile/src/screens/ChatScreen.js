// ChatScreen — Con Supabase Realtime (sin polling)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { apiWithRefresh } from '../api/client';
import { subscribeMensajes, unsubscribeChannel } from '../api/supabase';
import { colors, spacing, radius, shadows, typography } from '../styles/theme';

export default function ChatScreen({ route, navigation }) {
  const { matchId, perroNombre } = route.params || {};
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conectado, setConectado] = useState(false);
  const flatListRef = useRef(null);
  const channelRef = useRef(null);

  // Carga inicial + suscripción Realtime
  useEffect(() => {
    console.log('[Chat] Montado, matchId:', matchId);
    cargarMensajes();

    // Suscribirse a mensajes nuevos en tiempo real
    console.log('[Chat] Suscribiendo a Realtime...');
    const channel = subscribeMensajes(
      matchId,
      (nuevoMensaje) => {
        console.log('[Chat] 📩 Nuevo mensaje Realtime:', nuevoMensaje.id);
        setMensajes(prev => {
          // Evitar duplicados
          if (prev.some(m => m.id === nuevoMensaje.id)) return prev;
          return [...prev, nuevoMensaje];
        });
        setConectado(true);
      },
      () => {
        console.log('[Chat] ⚠️ Error de conexión Realtime');
        setConectado(false);
      }
    );
    channelRef.current = channel;

    return () => {
      console.log('[Chat] Desmontado, limpiando suscripción');
      if (channelRef.current) {
        unsubscribeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const cargarMensajes = async () => {
    try {
      console.log('[Chat] Cargando mensajes para match:', matchId);
      const data = await apiWithRefresh('GET', `/chat/${matchId}`);
      console.log('[Chat] Mensajes recibidos:', data.mensajes?.length || 0);
      setMensajes(data.mensajes || []);
      setConectado(true);
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
    const textToSend = texto.trim();
    setTexto('');
    try {
      await apiWithRefresh('POST', `/chat/${matchId}`, { contenido: textToSend });
      // El mensaje nuevo llegará por Realtime automáticamente
      console.log('[Chat] Mensaje enviado OK, esperando Realtime...');
    } catch (error) {
      console.log('[Chat] Error al enviar:', JSON.stringify(error).slice(0, 200));
      const msg = typeof error === 'string' ? error : error.message || 'Error al enviar';
      Alert.alert('Error', msg);
    } finally {
      setEnviando(false);
    }
  };

  const reportarChat = async (motivo) => {
    console.log('[Chat] reportarChat → matchId:', matchId, 'motivo:', motivo);
    try {
      const matches = await apiWithRefresh('GET', '/matches');
      const match = (matches.matches || []).find(m => m.id === matchId);
      const otroUsuarioId = match?.usuario1 || match?.usuario2;
      if (!otroUsuarioId) {
        Alert.alert('Error', 'No se pudo identificar al usuario');
        return;
      }
      await apiWithRefresh('POST', '/usuarios/reportar', {
        reportadoId: otroUsuarioId,
        motivo,
      });
      Alert.alert('Reportado', 'Gracias por reportar. Revisaremos el caso.');
    } catch (error) {
      const msg = typeof error === 'string' ? error
        : error?.mensaje || error?.message
        || (typeof error?.error === 'string' ? error.error : error?.error?.message || error?.error?.mensaje)
        || 'Error al reportar';
      Alert.alert('Error', msg);
    }
  };

  const formatTime = useCallback((dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <MaterialIcons name="pets" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {perroNombre || 'Chat'}
            </Text>
            <Text style={[styles.statusDot, conectado ? styles.online : styles.offline]}>
              {conectado ? '🟢 En vivo' : '🟡 Reconectando...'}
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.headerReportBtn}
          onPress={() => {
            Alert.alert('Reportar usuario', '¿Por qué reportas a este usuario?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Mensajes inapropiados', onPress: () => reportarChat('Mensajes inapropiados') },
              { text: 'Spam', onPress: () => reportarChat('Spam') },
              { text: 'Acoso', onPress: () => reportarChat('Acoso') },
              { text: 'Otro', onPress: () => {
                Alert.alert('Reportar', 'Reporte enviado. Gracias.');
              }},
            ]);
          }}
        >
          <MaterialIcons name="flag" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item, index) => item.id || index.toString()}
        style={styles.messageList}
        contentContainerStyle={mensajes.length === 0 ? styles.emptyList : styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="chat" size={40} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>Sin mensajes</Text>
            <Text style={styles.emptyText}>
              Envía el primer mensaje para iniciar la conversación
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const esMio = item.esPropio || item.propio;
          return (
            <View style={[
              styles.messageBubble,
              esMio ? styles.myMessage : styles.theirMessage,
            ]}>
              {!esMio && (
                <View style={styles.theirAvatarDot}>
                  <MaterialIcons name="pets" size={10} color={colors.accentDark} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.messageText, esMio && styles.myMessageText]}>
                  {item.texto}
                </Text>
                <Text style={[styles.messageTime, esMio && styles.myMessageTime]}>
                  {formatTime(item.fecha)}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.textMuted}
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
          {enviando ? (
            <ActivityIndicator size="small" color={colors.textWhite} />
          ) : (
            <MaterialIcons name="send" size={18} color={colors.textWhite} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    padding: spacing.xxl,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  statusDot: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  online: {
    color: '#4CAF50',
  },
  offline: {
    color: '#FF9800',
  },
  headerReportBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageList: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    ...shadows.sm,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  theirAvatarDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.textWhite,
  },
  messageTime: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.6)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    ...shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
