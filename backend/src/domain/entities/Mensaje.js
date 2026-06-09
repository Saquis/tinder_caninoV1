// Entidad Mensaje — Representa un mensaje en el chat
// Capa: domain/entities

class Mensaje {
  constructor({ id, matchId, remitenteId, texto, leido, fecha }) {
    this.id = id;
    this.matchId = matchId;
    this.remitenteId = remitenteId;
    this.texto = texto;
    this.leido = leido || false;
    this.fecha = fecha || new Date();
  }

  static crear({ matchId, remitenteId, texto }) {
    if (!matchId) throw new (require('./Usuario').AppError)('matchId es requerido', 400);
    if (!remitenteId) throw new (require('./Usuario').AppError)('remitenteId es requerido', 400);
    if (!texto || texto.trim().length === 0) throw new (require('./Usuario').AppError)('El mensaje no puede estar vacío', 400);
    if (texto.length > 2000) throw new (require('./Usuario').AppError)('El mensaje es demasiado largo (máx 2000 caracteres)', 400);

    return new Mensaje({ matchId, remitenteId, texto: texto.trim() });
  }

  toJSON() {
    return {
      id: this.id,
      matchId: this.matchId,
      remitenteId: this.remitenteId,
      texto: this.texto,
      leido: this.leido,
      fecha: this.fecha,
    };
  }
}

module.exports = { Mensaje };
