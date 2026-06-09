// Entidad Perro — Reglas de negocio del dominio
// Capa: domain/entities (JS puro, sin dependencias externas)

class Perro {
  constructor({ id, usuarioId, nombre, raza, edadMeses, sexo, castrado, descripcion, proposito, latitud, longitud, fotoPrincipal, fotos, activo, creadoEn }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.nombre = nombre;
    this.raza = raza || null;
    this.edadMeses = edadMeses || null;
    this.sexo = sexo || null;
    this.castrado = castrado || false;
    this.descripcion = descripcion || null;
    this.proposito = proposito || 'todo';
    this.latitud = latitud || null;
    this.longitud = longitud || null;
    this.fotoPrincipal = fotoPrincipal || null;
    this.fotos = fotos || [];
    this.activo = activo !== undefined ? activo : true;
    this.creadoEn = creadoEn || new Date();
  }

  static propositosValidos = ['jugar', 'pasear', 'reproduccion', 'todo'];
  static sexosValidos = ['macho', 'hembra'];

  static esNombreValido(nombre) {
    return nombre && nombre.trim().length >= 2;
  }

  static esEdadValida(edadMeses) {
    return edadMeses === null || edadMeses === undefined || (Number.isInteger(edadMeses) && edadMeses >= 0 && edadMeses <= 360);
  }

  static esPropositoValido(proposito) {
    return !proposito || Perro.propositosValidos.includes(proposito);
  }

  static esSexoValido(sexo) {
    return !sexo || Perro.sexosValidos.includes(sexo);
  }

  static esCoordenadaValida(lat, lng) {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return true;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  static crear({ usuarioId, nombre, raza, edadMeses, sexo, castrado, descripcion, proposito, latitud, longitud }) {
    if (!usuarioId) throw new (require('../../domain/entities/Usuario').AppError)('usuarioId es requerido', 400);
    if (!Perro.esNombreValido(nombre)) throw new (require('../../domain/entities/Usuario').AppError)('El nombre debe tener al menos 2 caracteres', 400);
    if (!Perro.esEdadValida(edadMeses)) throw new (require('../../domain/entities/Usuario').AppError)('Edad inválida (0–360 meses)', 400);
    if (!Perro.esPropositoValido(proposito)) throw new (require('../../domain/entities/Usuario').AppError)(`Propósito inválido. Válidos: ${Perro.propositosValidos.join(', ')}`, 400);
    if (!Perro.esSexoValido(sexo)) throw new (require('../../domain/entities/Usuario').AppError)(`Sexo inválido. Válidos: ${Perro.sexosValidos.join(', ')}`, 400);
    if (!Perro.esCoordenadaValida(latitud, longitud)) throw new (require('../../domain/entities/Usuario').AppError)('Coordenadas geográficas inválidas', 400);

    return new Perro({
      usuarioId,
      nombre: nombre.trim(),
      raza: raza ? raza.trim() : null,
      edadMeses,
      sexo,
      castrado: castrado || false,
      descripcion: descripcion ? descripcion.trim() : null,
      proposito: proposito || 'todo',
      latitud,
      longitud,
    });
  }

  toJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      nombre: this.nombre,
      raza: this.raza,
      edadMeses: this.edadMeses,
      sexo: this.sexo,
      castrado: this.castrado,
      descripcion: this.descripcion,
      proposito: this.proposito,
      latitud: parseFloat(this.latitud),
      longitud: parseFloat(this.longitud),
      fotoPrincipal: this.fotoPrincipal,
      fotos: this.fotos,
      activo: this.activo,
      creadoEn: this.creadoEn,
    };
  }
}

module.exports = { Perro };
