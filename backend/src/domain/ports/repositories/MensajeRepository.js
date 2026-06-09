// Puerto MensajeRepository — Contrato para persistencia de mensajes
// Capa: domain/ports

class MensajeRepository {
  async save(mensaje) { throw new Error('save() no implementado'); }
  async findByMatchId(matchId, { offset, limite }) { throw new Error('findByMatchId() no implementado'); }
  async marcarLeidos(matchId, usuarioId) { throw new Error('marcarLeidos() no implementado'); }
}

module.exports = { MensajeRepository };
