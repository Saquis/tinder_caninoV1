// Puerto BloqueoRepository
class BloqueoRepository {
  async save(bloqueo) { throw new Error('save() no implementado'); }
  async findBloqueo(usuarioId, bloqueadoId) { throw new Error('findBloqueo() no implementado'); }
  async findBloqueados(usuarioId) { throw new Error('findBloqueados() no implementado'); }
  async findQuienMeBloqueo(usuarioId) { throw new Error('findQuienMeBloqueo() no implementado'); }
  async delete(usuarioId, bloqueadoId) { throw new Error('delete() no implementado'); }
}
module.exports = { BloqueoRepository };
