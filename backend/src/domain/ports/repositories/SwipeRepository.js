// Puerto SwipeRepository — Contrato para persistencia de swipes
// Capa: domain/ports

class SwipeRepository {
  async save(swipe) { throw new Error('save() no implementado'); }
  async findByUsuarioOrigen(usuarioId) { throw new Error('findByUsuarioOrigen() no implementado'); }
  async findSwipe(usuarioOrigen, usuarioDestino) { throw new Error('findSwipe() no implementado'); }
  async countSwipesToday(usuarioId) { throw new Error('countSwipesToday() no implementado'); }
}

module.exports = { SwipeRepository };
