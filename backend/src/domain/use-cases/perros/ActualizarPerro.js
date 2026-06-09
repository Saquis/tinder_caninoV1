// ActualizarPerro — Caso de uso: actualizar perfil de perro
// Capa: domain/use-cases

class ActualizarPerro {
  constructor(perroRepository) {
    this.perroRepository = perroRepository;
  }

  async execute({ id, usuarioId, cambios }) {
    const perro = await this.perroRepository.findById(id);
    if (!perro || !perro.activo) throw new (require('../../entities/Usuario').AppError)('Perro no encontrado', 404);
    if (perro.usuarioId !== usuarioId) throw new (require('../../entities/Usuario').AppError)('No tienes permiso para editar este perro', 403);

    const camposPermitidos = ['nombre', 'raza', 'edadMeses', 'sexo', 'castrado', 'descripcion', 'proposito', 'latitud', 'longitud'];
    const cambiosLimpios = {};
    for (const key of camposPermitidos) {
      if (cambios[key] !== undefined) cambiosLimpios[key] = cambios[key];
    }

    if (Object.keys(cambiosLimpios).length === 0) throw new (require('../../entities/Usuario').AppError)('No hay campos válidos para actualizar', 400);

    const actualizado = await this.perroRepository.update(id, cambiosLimpios);
    return actualizado.toJSON();
  }
}

module.exports = { ActualizarPerro };
