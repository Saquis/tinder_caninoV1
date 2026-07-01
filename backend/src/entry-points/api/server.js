// Server — Entry point del API REST con inyección de dependencias
// Capa: entry-points/api

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('../../config/env');
const { errorMiddleware } = require('./middleware/error.middleware');

// Infraestructura
const { JwtAuthService } = require('../../infrastructure/auth/JwtAuthService');
const { SupabaseUsuarioRepository } = require('../../infrastructure/database/supabase/SupabaseUsuarioRepository');
const { SupabasePerroRepository } = require('../../infrastructure/database/supabase/SupabasePerroRepository');
const { SupabaseSwipeRepository } = require('../../infrastructure/database/supabase/SupabaseSwipeRepository');
const { SupabaseMatchRepository } = require('../../infrastructure/database/supabase/SupabaseMatchRepository');
const { SupabaseMensajeRepository } = require('../../infrastructure/database/supabase/SupabaseMensajeRepository');
const { SupabaseReporteRepository } = require('../../infrastructure/database/supabase/SupabaseReporteRepository');
const { SupabaseBloqueoRepository } = require('../../infrastructure/database/supabase/SupabaseBloqueoRepository');
const { SupabaseRefreshTokenRepository } = require('../../infrastructure/database/supabase/SupabaseRefreshTokenRepository');
const { SupabaseStorageService } = require('../../infrastructure/storage/SupabaseStorageService');

// Dependencias compartidas
const authService = new JwtAuthService();
const usuarioRepository = new SupabaseUsuarioRepository();
const perroRepository = new SupabasePerroRepository();
const swipeRepository = new SupabaseSwipeRepository();
const matchRepository = new SupabaseMatchRepository();
const mensajeRepository = new SupabaseMensajeRepository();
const reporteRepository = new SupabaseReporteRepository();
const bloqueoRepository = new SupabaseBloqueoRepository();
const refreshTokenRepository = new SupabaseRefreshTokenRepository();
const storageService = new SupabaseStorageService();

// Fábrica de rutas
const { crearAuthRoutes } = require('./routes/auth.routes');
const { crearUsuariosRoutes } = require('./routes/usuarios.routes');
const { crearPerrosRoutes } = require('./routes/perros.routes');
const { crearSwipesRoutes } = require('./routes/swipes.routes');
const { crearMatchesRoutes } = require('./routes/matches.routes');
const { crearChatRoutes } = require('./routes/chat.routes');

function crearApp() {
  const app = express();

  // Middleware global
  app.use(cors({ origin: '*' }));
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting por IP
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30,
    message: { error: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' } },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth', authLimiter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // Rutas con dependencias inyectadas
  app.use('/api/auth', crearAuthRoutes(usuarioRepository, authService, refreshTokenRepository));
  app.use('/api/usuarios', crearUsuariosRoutes(usuarioRepository, reporteRepository, bloqueoRepository, authService, perroRepository, storageService));
  app.use('/api/perros', crearPerrosRoutes(perroRepository, swipeRepository, bloqueoRepository, authService, storageService));
  app.use('/api/swipes', crearSwipesRoutes(swipeRepository, matchRepository, perroRepository, authService));
  app.use('/api/matches', crearMatchesRoutes(matchRepository, authService));
  app.use('/api/chat', crearChatRoutes(mensajeRepository, matchRepository, authService));

  // Catch-all 404 — rutas no encontradas (Express 5 no acepta '*' como path)
  app.use((req, res) => {
    res.status(404).json({ error: { message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` } });
  });

  // Error handler
  app.use(errorMiddleware);

  return app;
}

module.exports = { crearApp };
