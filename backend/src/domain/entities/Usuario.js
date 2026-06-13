// Entidad Usuario — Reglas de negocio del dominio
// Capa: domain/entities (JS puro, sin dependencias externas)

class Usuario {
  constructor({ id, nombre, email, passwordHash, telefono, ciudad, premium, fechaRegistro, ultimoAcceso, activo }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.passwordHash = passwordHash;
    this.telefono = telefono || null;
    this.ciudad = ciudad || null;
    this.premium = premium || false;
    this.fechaRegistro = fechaRegistro || new Date();
    this.ultimoAcceso = ultimoAcceso || null;
    this.activo = activo !== undefined ? activo : true;
  }

  // Valida que el email tenga formato básico
  static esEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Valida que el nombre no esté vacío
  static esNombreValido(nombre) {
    return nombre && nombre.trim().length >= 2;
  }

  // Valida que la contraseña tenga al menos 6 caracteres
  static esPasswordValida(password) {
    return password && password.length >= 6;
  }

  static crear({ nombre, email, passwordHash, telefono, ciudad }) {
    if (!Usuario.esNombreValido(nombre)) {
      throw new AppError('El nombre debe tener al menos 2 caracteres', 400);
    }
    if (!Usuario.esEmailValido(email)) {
      throw new AppError('Email inválido', 400);
    }
    // Password validation se hace en el use case antes de hashear
    // (el hash de bcrypt siempre tiene 60 chars, no se puede validar aquí)

    return new Usuario({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      telefono: telefono || null,
      ciudad: ciudad || null,
    });
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      ciudad: this.ciudad,
      premium: this.premium,
      fechaRegistro: this.fechaRegistro,
      activo: this.activo,
    };
  }
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

Usuario.AppError = AppError;
module.exports = { Usuario, AppError };
