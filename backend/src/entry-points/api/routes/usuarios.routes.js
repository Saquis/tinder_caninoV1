// Usuarios Routes — Perfil, reportes, bloqueos
// Capa: entry-points/api/routes

const { Router } = require('express');
const { crearUsuariosController } = require('../controllers/usuarios.controller');
const { crearAuthMiddleware } = require('../middleware/auth.middleware');

function crearUsuariosRoutes(usuarioRepository, reporteRepository, bloqueoRepository, authService, perroRepository, storageService) {
  const router = Router();
  const controller = crearUsuariosController(usuarioRepository, reporteRepository, bloqueoRepository, perroRepository, storageService);
  const auth = crearAuthMiddleware(authService);

  router.get('/me', auth.requiereAuth, controller.perfil);
  router.put('/me', auth.requiereAuth, controller.actualizar);
  router.delete('/me', auth.requiereAuth, controller.eliminar);
  router.post('/reportar', auth.requiereAuth, controller.reportar);
  router.post('/bloquear', auth.requiereAuth, controller.bloquear);
  router.get('/bloqueados', auth.requiereAuth, controller.bloqueados);
  router.delete('/bloqueados/:bloqueadoId', auth.requiereAuth, controller.desbloquear);

  return router;
}

module.exports = { crearUsuariosRoutes };
