// Supabase Client — Instancia única
// Capa: infrastructure/database/supabase

const { createClient } = require('@supabase/supabase-js');
const config = require('../../../config/env');

// Cliente anónimo (para operaciones desde el frontend con RLS)
const supabaseAnon = createClient(config.supabase.url, config.supabase.anonKey);

// Cliente con service_role (para operaciones del backend, salta RLS)
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey);

module.exports = {
  supabaseAnon,
  supabaseAdmin,
};
