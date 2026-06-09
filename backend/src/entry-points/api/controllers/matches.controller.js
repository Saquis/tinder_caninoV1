// Matches Controller — Maneja peticiones HTTP de matches
// Capa: entry-points/api/controllers

function crearMatchesController(matchRepository) {
  return {
    async listar(req, res, next) {
      try {
        const matches = await matchRepository.findByUsuarioConDetalles(req.usuario.id);
        res.json({ matches });
      } catch (e) { next(e); }
    },

    async eliminar(req, res, next) {
      try {
        await matchRepository.delete(req.params.id);
        res.json({ message: 'Match eliminado' });
      } catch (e) { next(e); }
    },
  };
}

module.exports = { crearMatchesController };
