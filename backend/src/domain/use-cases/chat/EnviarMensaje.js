// EnviarMensaje — Caso de uso: enviar mensaje en un match
// Capa: domain/use-cases

const { Mensaje } = require('../../entities/Mensaje');

class EnviarMensaje {
  constructor(mensajeRepository, matchRepository) {
    this.mensajeRepository = mensajeRepository;
    this.matchRepository = matchRepository;
  }

  async execute({ matchId, remitenteId, texto }) {
    // 1. Validar que el match existe y el usuario participa
    const match = await this.matchRepository.findById(matchId);
    if (!match || !match.activo) throw new (require('../../entities/Usuario').AppError)('Match no encontrado', 404);
    if (match.usuario1 !== remitenteId && match.usuario2 !== remitenteId) {
      throw new (require('../../entities/Usuario').AppError)('No participas en este match', 403);
    }

    // 2. Crear y guardar mensaje
    const mensaje = Mensaje.crear({ matchId, remitenteId, texto });
    const guardado = await this.mensajeRepository.save(mensaje);

    return guardado.toJSON();
  }
}

module.exports = { EnviarMensaje };
