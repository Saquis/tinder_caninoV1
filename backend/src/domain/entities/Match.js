// Entidad Match — Representa un match entre dos usuarios
// Capa: domain/entities

class Match {
  constructor({ id, usuario1, usuario2, fechaMatch, activo }) {
    this.id = id;
    this.usuario1 = usuario1;
    this.usuario2 = usuario2;
    this.fechaMatch = fechaMatch || new Date();
    this.activo = activo !== undefined ? activo : true;
  }

  static crear({ usuario1, usuario2 }) {
    if (!usuario1 || !usuario2) throw new (require('./Usuario').AppError)('Se requieren dos usuarios para un match', 400);
    if (usuario1 === usuario2) throw new (require('./Usuario').AppError)('No puedes hacer match contigo mismo', 400);

    // Normalizar: usuario1 siempre es el ID más pequeño para consistencia
    const [u1, u2] = usuario1 < usuario2 ? [usuario1, usuario2] : [usuario2, usuario1];

    return new Match({ usuario1: u1, usuario2: u2 });
  }

  toJSON() {
    return {
      id: this.id,
      usuario1: this.usuario1,
      usuario2: this.usuario2,
      fechaMatch: this.fechaMatch,
      activo: this.activo,
    };
  }
}

module.exports = { Match };
