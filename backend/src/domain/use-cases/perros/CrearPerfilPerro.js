// CrearPerfilPerro — Caso de uso: crear perfil de perro
// Capa: domain/use-cases

const { Perro } = require('../../entities/Perro');

class CrearPerfilPerro {
  constructor(perroRepository) {
    this.perroRepository = perroRepository;
  }

  async execute({ usuarioId, nombre, raza, edadMeses, sexo, castrado, descripcion, proposito, latitud, longitud }) {
    // Normalizar: multipart/form-data envía campos como string
    if (typeof edadMeses === 'string') {
      edadMeses = parseInt(edadMeses, 10);
    }

    const perro = Perro.crear({ usuarioId, nombre, raza, edadMeses, sexo, castrado, descripcion, proposito, latitud, longitud });
    const guardado = await this.perroRepository.save(perro);
    return guardado.toJSON();
  }
}

module.exports = { CrearPerfilPerro };
