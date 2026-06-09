// RegistrarUsuario — Caso de uso: creación de cuenta
// Capa: domain/use-cases

const { Usuario } = require('../../entities/Usuario');
const config = require('../../../config/env');

class RegistrarUsuario {
  constructor(usuarioRepository, authService, refreshTokenRepository) {
    this.usuarioRepository = usuarioRepository;
    this.authService = authService;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async execute({ nombre, email, password, telefono, ciudad }) {
    // 1. Validar que el email no esté registrado
    const existente = await this.usuarioRepository.findByEmail(email);
    if (existente) {
      throw new Usuario.AppError('El email ya está registrado', 409);
    }

    // 2. Hashear la contraseña
    const passwordHash = await this.authService.hashPassword(password);

    // 3. Crear la entidad Usuario (valida internamente)
    const usuario = Usuario.crear({ nombre, email, passwordHash, telefono, ciudad });

    // 4. Guardar en BD
    const usuarioGuardado = await this.usuarioRepository.save(usuario);

    // 5. Generar tokens
    const tokenPayload = { id: usuarioGuardado.id, email: usuarioGuardado.email };
    const accessToken = this.authService.generarToken(tokenPayload);
    const refreshToken = this.authService.generarRefreshToken(tokenPayload);

    // 6. Guardar refresh token en BD (para poder invalidarlo luego)
    const refreshDecoded = this.authService.decodificarRefreshToken(refreshToken);
    await this.refreshTokenRepository.save({
      usuarioId: usuarioGuardado.id,
      token: refreshToken,
      expiresAt: new Date(refreshDecoded.exp * 1000).toISOString(),
    });

    return {
      usuario: usuarioGuardado.toJSON(),
      accessToken,
      refreshToken,
      tienePerro: false,
    };
  }
}

module.exports = { RegistrarUsuario };
