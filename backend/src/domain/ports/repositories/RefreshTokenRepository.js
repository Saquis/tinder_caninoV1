// Puerto RefreshTokenRepository
class RefreshTokenRepository {
  async save(refreshToken) { throw new Error('save() no implementado'); }
  async find(token) { throw new Error('find() no implementado'); }
  async deleteByUsuario(usuarioId) { throw new Error('deleteByUsuario() no implementado'); }
  async delete(token) { throw new Error('delete() no implementado'); }
}
module.exports = { RefreshTokenRepository };
