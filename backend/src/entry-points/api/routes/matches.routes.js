// Matches Routes
// Capa: entry-points/api/routes

const { Router } = require('express');
const { crearMatchesController } = require('../controllers/matches.controller');
const { crearAuthMiddleware } = require('../middleware/auth.middleware');

function crearMatchesRoutes(matchRepository, authService) {
  const router = Router();
  const controller = crearMatchesController(matchRepository);
  const auth = crearAuthMiddleware(authService);

  router.get('/', auth.requiereAuth, controller.listar);
  router.delete('/:id', auth.requiereAuth, controller.eliminar);

  return router;
}

module.exports = { crearMatchesRoutes };
