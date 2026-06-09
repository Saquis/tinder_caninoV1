// Chat Controller — Maneja peticiones HTTP de chat
// Capa: entry-points/api/controllers

const { EnviarMensaje } = require('../../../domain/use-cases/chat/EnviarMensaje');
const { ObtenerMensajes } = require('../../../domain/use-cases/chat/ObtenerMensajes');

function crearChatController(mensajeRepository, matchRepository) {
  const enviar = new EnviarMensaje(mensajeRepository, matchRepository);
  const obtener = new ObtenerMensajes(mensajeRepository, matchRepository);

  return {
    async listarMensajes(req, res, next) {
      try {
        const { pagina } = req.query;
        const resultado = await obtener.execute({ matchId: req.params.matchId, usuarioId: req.usuario.id, pagina: parseInt(pagina, 10) || 0 });
        res.json(resultado);
      } catch (e) { next(e); }
    },

    async enviarMensaje(req, res, next) {
      try {
        const { contenido: texto } = req.body;
        const resultado = await enviar.execute({ matchId: req.params.matchId, remitenteId: req.usuario.id, texto });
        res.status(201).json(resultado);
      } catch (e) { next(e); }
    },

    async marcarLeidos(req, res, next) {
      try {
        await mensajeRepository.marcarLeidos(req.params.matchId, req.usuario.id);
        res.json({ message: 'Mensajes marcados como leídos' });
      } catch (e) { next(e); }
    },
  };
}

module.exports = { crearChatController };
