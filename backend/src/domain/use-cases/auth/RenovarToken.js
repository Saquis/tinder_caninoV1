// RenovarToken — Caso de uso: refresh de access token
// Capa: domain/use-cases

class RenovarToken {
  constructor(usuarioRepository, authService, refreshTokenRepository) {
    this.usuarioRepository = usuarioRepository;
    this.authService = authService;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  async execute({ refreshToken }) {
    // 1. Verificar que el refresh token existe en BD
    const tokenEnBD = await this.refreshTokenRepository.find(refreshToken);
    if (!tokenEnBD) {
      throw new (require('../../entities/Usuario').AppError)('Refresh token inválido o expirado', 401);
    }

    // 2. Verificar el JWT del refresh token
    const payload = this.authService.verificarRefreshToken(refreshToken);
    if (!payload) {
      await this.refreshTokenRepository.delete(refreshToken);
      throw new (require('../../entities/Usuario').AppError)('Refresh token inválido', 401);
    }

    // 3. Verificar que el usuario aún existe
    const usuario = await this.usuarioRepository.findById(payload.id);
    if (!usuario || !usuario.activo) {
      await this.refreshTokenRepository.delete(refreshToken);
      throw new (require('../../entities/Usuario').AppError)('Usuario no encontrado o desactivado', 401);
    }

    // 4. Generar nuevo access token
    const tokenPayload = { id: usuario.id, email: usuario.email };
    const nuevoAccessToken = this.authService.generarToken(tokenPayload);

    return { accessToken: nuevoAccessToken };
  }

  async logout({ refreshToken, usuarioId }) {
    if (refreshToken) {
      await this.refreshTokenRepository.delete(refreshToken);
    } else {
      await this.refreshTokenRepository.deleteByUsuario(usuarioId);
    }
  }
}

module.exports = { RenovarToken };
