// Chat Routes
// Capa: entry-points/api/routes

const { Router } = require('express');
const { crearChatController } = require('../controllers/chat.controller');
const { crearAuthMiddleware } = require('../middleware/auth.middleware');

function crearChatRoutes(mensajeRepository, matchRepository, authService) {
  const router = Router();
  const controller = crearChatController(mensajeRepository, matchRepository);
  const auth = crearAuthMiddleware(authService);

  router.get('/:matchId', auth.requiereAuth, controller.listarMensajes);
  router.post('/:matchId', auth.requiereAuth, controller.enviarMensaje);
  router.post('/:matchId/leidos', auth.requiereAuth, controller.marcarLeidos);

  return router;
}

module.exports = { crearChatRoutes };
