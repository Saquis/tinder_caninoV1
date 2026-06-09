// Puerto MatchRepository — Contrato para persistencia de matches
// Capa: domain/ports

class MatchRepository {
  async save(match) { throw new Error('save() no implementado'); }
  async findById(id) { throw new Error('findById() no implementado'); }
  async findByUsuario(usuarioId) { throw new Error('findByUsuario() no implementado'); }
  async findByUsuarioConDetalles(usuarioId) { throw new Error('findByUsuarioConDetalles() no implementado'); }
  async findMatch(usuario1, usuario2) { throw new Error('findMatch() no implementado'); }
  async delete(id) { throw new Error('delete() no implementado'); }
}

module.exports = { MatchRepository };
