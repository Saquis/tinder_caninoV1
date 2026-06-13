// Puerto PerroRepository — Contrato para persistencia de perros
// Capa: domain/ports (interfaz, no implementación)

class PerroRepository {
  async save(perro) { throw new Error('save() no implementado'); }
  async findById(id) { throw new Error('findById() no implementado'); }
  async findByUsuarioId(usuarioId) { throw new Error('findByUsuarioId() no implementado'); }
  async findCercanos({ latitud, longitud, distanciaKm, excluirIds, limite, proposito, raza, edadMax }) { throw new Error('findCercanos() no implementado'); }
  async update(id, cambios) { throw new Error('update() no implementado'); }
  async delete(id) { throw new Error('delete() no implementado'); }
}

module.exports = { PerroRepository };
