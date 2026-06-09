// ObtenerMensajes — Caso de uso: obtener historial de mensajes
// Capa: domain/use-cases

class ObtenerMensajes {
  constructor(mensajeRepository, matchRepository) {
    this.mensajeRepository = mensajeRepository;
    this.matchRepository = matchRepository;
  }

  async execute({ matchId, usuarioId, pagina = 0 }) {
    const match = await this.matchRepository.findById(matchId);
    if (!match || !match.activo) throw new (require('../../entities/Usuario').AppError)('Match no encontrado', 404);
    if (match.usuario1 !== usuarioId && match.usuario2 !== usuarioId) {
      throw new (require('../../entities/Usuario').AppError)('No participas en este match', 403);
    }

    const limite = 50;
    const offset = pagina * limite;
    const mensajes = await this.mensajeRepository.findByMatchId(matchId, { offset, limite });

    return {
      mensajes: mensajes.map(m => ({
        ...m.toJSON(),
        esPropio: m.remitenteId === usuarioId,
      })),
      pagina,
      hayMas: mensajes.length === limite,
    };
  }
}

module.exports = { ObtenerMensajes };
