// RegistrarSwipe — Caso de uso: registrar like/nope/super + detectar match
// Capa: domain/use-cases

const { Swipe } = require('../../entities/Swipe');
const { Match } = require('../../entities/Match');
const config = require('../../../config/env');

class RegistrarSwipe {
  constructor(swipeRepository, matchRepository, perroRepository) {
    this.swipeRepository = swipeRepository;
    this.matchRepository = matchRepository;
    this.perroRepository = perroRepository;
  }

  async execute({ usuarioOrigen, usuarioDestino, tipo }) {
    // 1. Validar que destino tenga perro
    const perrosDestino = await this.perroRepository.findByUsuarioId(usuarioDestino);
    if (!perrosDestino || perrosDestino.length === 0) {
      throw new (require('../../entities/Usuario').AppError)('El usuario destino no tiene un perro registrado', 400);
    }

    // 2. Validar que origen tenga perro y no haya swipado ya
    const perrosOrigen = await this.perroRepository.findByUsuarioId(usuarioOrigen);
    if (!perrosOrigen || perrosOrigen.length === 0) {
      throw new (require('../../entities/Usuario').AppError)('Debes registrar tu perro primero', 400);
    }

    const existente = await this.swipeRepository.findSwipe(usuarioOrigen, usuarioDestino);
    if (existente) throw new (require('../../entities/Usuario').AppError)('Ya swipeaste a este usuario', 409);

    // 3. Límite de swipes diarios
    if (tipo !== 'nope') {
      const swipesHoy = await this.swipeRepository.countSwipesToday(usuarioOrigen);
      if (swipesHoy >= config.app.swipesDiariosGratis) {
        throw new (require('../../entities/Usuario').AppError)(`Límite diario de ${config.app.swipesDiariosGratis} swipes alcanzado`, 403);
      }
    }

    // 4. Crear y guardar swipe
    const swipe = Swipe.crear({ usuarioOrigen, usuarioDestino, tipo });
    const swipeGuardado = await this.swipeRepository.save(swipe);

    // 5. Si es like o super, verificar match recíproco
    let match = null;
    if (tipo === 'like' || tipo === 'super') {
      const swipeReciproco = await this.swipeRepository.findSwipe(usuarioDestino, usuarioOrigen);
      if (swipeReciproco && (swipeReciproco.tipo === 'like' || swipeReciproco.tipo === 'super')) {
        const matchEntity = Match.crear({ usuario1: usuarioOrigen, usuario2: usuarioDestino });
        match = await this.matchRepository.save(matchEntity);
      }
    }

    return { swipe: { id: swipeGuardado.id, tipo }, match: match ? match.toJSON() : null };
  }
}

module.exports = { RegistrarSwipe };
