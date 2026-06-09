// Puerto UsuarioRepository — Contrato para persistencia de usuarios
// Capa: domain/ports (interfaz, no implementación)

/**
 * @interface UsuarioRepository
 *
 * Métodos que debe implementar cualquier adaptador de persistencia:
 *   save(usuario)        → Usuario
 *   findByEmail(email)   → Usuario | null
 *   findById(id)         → Usuario | null
 *   update(id, cambios)  → Usuario
 *   delete(id)           → void
 */

class UsuarioRepository {
  async save(usuario) {
    throw new Error('Método save() no implementado');
  }

  async findByEmail(email) {
    throw new Error('Método findByEmail() no implementado');
  }

  async findById(id) {
    throw new Error('Método findById() no implementado');
  }

  async update(id, cambios) {
    throw new Error('Método update() no implementado');
  }

  async delete(id) {
    throw new Error('Método delete() no implementado');
  }

  async findPerroByUsuarioId(usuarioId) {
    throw new Error('Método findPerroByUsuarioId() no implementado');
  }
}

module.exports = { UsuarioRepository };
