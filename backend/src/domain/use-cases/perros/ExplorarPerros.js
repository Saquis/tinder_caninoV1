// ExplorarPerros — Caso de uso: obtener perros cercanos para swipe
// Capa: domain/use-cases

const config = require('../../../config/env');

class ExplorarPerros {
  constructor(perroRepository, swipeRepository) {
    this.perroRepository = perroRepository;
    this.swipeRepository = swipeRepository;
  }

  async execute({ usuarioId, latitud, longitud, pagina = 0, bloqueadosIds = [], proposito, raza, edadMax, distanciaMax }) {
    const misPerros = await this.perroRepository.findByUsuarioId(usuarioId);
    if (!misPerros || misPerros.length === 0) {
      throw new (require('../../entities/Usuario').AppError)('Debes crear el perfil de tu perro primero', 400);
    }
    const miPerro = misPerros[0];

    // Obtener IDs ya swipedaos por este usuario
    const yaSwipedaos = (await this.swipeRepository.findByUsuarioOrigen(usuarioId))
      .map(s => s.usuarioDestino);

    // Excluir: swipedaos, yo mismo, bloqueados (por mí o que me bloquearon)
    const excluirIds = [...new Set([...yaSwipedaos, usuarioId, ...bloqueadosIds])];
    const distanciaKm = distanciaMax ? parseFloat(distanciaMax) : config.app.maxDistanciaKm;
    const limite = 20;
    const offset = pagina * limite;

    const resultado = await this.perroRepository.findCercanos({
      latitud: miPerro.latitud || latitud,
      longitud: miPerro.longitud || longitud,
      distanciaKm,
      excluirIds,
      limite,
      offset,
      proposito,
      raza,
      edadMax: edadMax ? parseInt(edadMax, 10) : undefined,
    });

    return {
      perros: resultado.perros.map(p => p.toJSON()),
      total: resultado.total,
      pagina,
      hayMas: offset + limite < resultado.total,
    };
  }
}

module.exports = { ExplorarPerros };
