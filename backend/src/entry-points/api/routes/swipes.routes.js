// Swipes Routes
// Capa: entry-points/api/routes

const { Router } = require('express');
const { crearSwipesController } = require('../controllers/swipes.controller');
const { crearAuthMiddleware } = require('../middleware/auth.middleware');

function crearSwipesRoutes(swipeRepository, matchRepository, perroRepository, authService) {
  const router = Router();
  const controller = crearSwipesController(swipeRepository, matchRepository, perroRepository);
  const auth = crearAuthMiddleware(authService);

  router.post('/', auth.requiereAuth, controller.registrarSwipe);

  return router;
}

module.exports = { crearSwipesRoutes };
