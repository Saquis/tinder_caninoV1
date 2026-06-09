// Swipes Controller — Maneja peticiones HTTP de swipes
// Capa: entry-points/api/controllers

const { RegistrarSwipe } = require('../../../domain/use-cases/swipes/RegistrarSwipe');

function crearSwipesController(swipeRepository, matchRepository, perroRepository) {
  const registrar = new RegistrarSwipe(swipeRepository, matchRepository, perroRepository);

  return {
    async registrarSwipe(req, res, next) {
      try {
        const { usuarioDestino, tipo } = req.body;
        const resultado = await registrar.execute({
          usuarioOrigen: req.usuario.id,
          usuarioDestino,
          tipo,
        });

        // Estructura explícita para el frontend
        if (resultado.match) {
          res.status(201).json({
            swipe: { id: resultado.swipe.id, tipo: resultado.swipe.tipo },
            match: {
              encontrado: true,
              matchId: resultado.match.id,
            },
          });
        } else {
          res.status(201).json({
            swipe: { id: resultado.swipe.id, tipo: resultado.swipe.tipo },
            match: { encontrado: false },
          });
        }
      } catch (e) { next(e); }
    },
  };
}

module.exports = { crearSwipesController };
