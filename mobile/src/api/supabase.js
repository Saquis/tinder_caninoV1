// Cliente Supabase para el frontend React Native
// Usa la anon key — sin JWT custom (el filtro match_id es la seguridad)
import { createClient } from '@supabase/supabase-js';
import { getToken } from './client';

const SUPABASE_URL = 'https://ordgfbmogvtdueiaqihy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IpvIlXdRNHW_Md0SFGXR7Q_OG_wEN_H';

let supabase = null;

export function getSupabase() {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabase;
}

// Suscribirse a nuevos mensajes de un match
export function subscribeMensajes(matchId, onNuevoMensaje, onError) {
  const client = getSupabase();

  const channel = client
    .channel(`match-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        if (onNuevoMensaje) onNuevoMensaje(payload.new);
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' && onError) {
        onError('Error de conexión Realtime');
      }
    });

  return channel;
}

// Cancelar suscripción
export function unsubscribeChannel(channel) {
  if (channel) {
    getSupabase().removeChannel(channel);
  }
}
