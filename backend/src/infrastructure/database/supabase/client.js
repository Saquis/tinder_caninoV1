// Supabase Client — Instancia única
// Capa: infrastructure/database/supabase

const { createClient } = require('@supabase/supabase-js');
const config = require('../../../config/env');

// WebSocket para Node < 22 (Supabase Realtime lo necesita)
let wsTransport;
try {
  wsTransport = require('ws');
} catch {
  wsTransport = undefined;
}

const realtimeConfig = wsTransport ? { transport: wsTransport } : {};

// Cliente anónimo (para operaciones desde el frontend con RLS)
const supabaseAnon = createClient(config.supabase.url, config.supabase.anonKey, {
  realtime: realtimeConfig,
});

// Cliente con service_role (para operaciones del backend, salta RLS)
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey, {
  realtime: realtimeConfig,
});

module.exports = {
  supabaseAnon,
  supabaseAdmin,
};
