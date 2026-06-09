// Entidad Swipe — Representa un like/nope/super
// Capa: domain/entities

class Swipe {
  constructor({ id, usuarioOrigen, usuarioDestino, tipo, fecha }) {
    this.id = id;
    this.usuarioOrigen = usuarioOrigen;
    this.usuarioDestino = usuarioDestino;
    this.tipo = tipo;
    this.fecha = fecha || new Date();
  }

  static tiposValidos = ['like', 'nope', 'super'];

  static crear({ usuarioOrigen, usuarioDestino, tipo }) {
    if (!usuarioOrigen || !usuarioDestino) throw new (require('./Usuario').AppError)('usuarioOrigen y usuarioDestino son requeridos', 400);
    if (usuarioOrigen === usuarioDestino) throw new (require('./Usuario').AppError)('No puedes swipetearte a ti mismo', 400);
    if (!Swipe.tiposValidos.includes(tipo)) throw new (require('./Usuario').AppError)(`Tipo inválido: ${tipo}`, 400);

    return new Swipe({ usuarioOrigen, usuarioDestino, tipo });
  }
}

module.exports = { Swipe };
