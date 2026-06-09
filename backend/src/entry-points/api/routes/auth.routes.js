// Auth Routes — Definiciones de rutas de autenticación
// Capa: entry-points/api/routes

const { Router } = require('express');
const { crearAuthController } = require('../controllers/auth.controller');
const { crearAuthMiddleware } = require('../middleware/auth.middleware');

function crearAuthRoutes(usuarioRepository, authService, refreshTokenRepository) {
  const router = Router();
  const controller = crearAuthController(usuarioRepository, authService, refreshTokenRepository);
  const auth = crearAuthMiddleware(authService);

  router.post('/registro', controller.registro);
  router.post('/login', controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/logout', auth.requiereAuth, controller.logout);

  return router;
}

module.exports = { crearAuthRoutes };
