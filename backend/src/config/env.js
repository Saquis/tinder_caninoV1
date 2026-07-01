// Config — Variables de entorno validadas
// Capa: entry-points (configuración global)

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Variable de entorno faltante: ${key}`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  app: {
    maxDistanciaKm: parseInt(process.env.MAX_DISTANCIA_KM, 10) || 50,
    maxFotosGratis: parseInt(process.env.MAX_FOTOS_GRATIS, 10) || 2,
    maxFotosPremium: parseInt(process.env.MAX_FOTOS_PREMIUM, 10) || 5,
    swipesDiariosGratis: parseInt(process.env.SWIPES_DIARIOS_GRATIS, 10) || 30,
  },
};
