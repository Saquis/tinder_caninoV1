// JwtAuthService — Implementación de AuthService con JWT + bcrypt
// Capa: infrastructure/auth

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/env');
const { AuthService } = require('../../domain/ports/services/AuthService');

class JwtAuthService extends AuthService {
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  generarToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  verificarToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch {
      return null;
    }
  }

  generarRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  verificarRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch {
      return null;
    }
  }

  decodificarRefreshToken(token) {
    return jwt.decode(token);
  }
}

module.exports = { JwtAuthService };
