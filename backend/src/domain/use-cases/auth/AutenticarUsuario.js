// AutenticarUsuario — Caso de uso: login
// Capa: domain/use-cases (reglas de negocio, sin dependencias externas)

class AutenticarUsuario {
  constructor(usuarioRepository, authService) {
    this.usuarioRepository = usuarioRepository;
    this.authService = authService;
  }

  async execute({ email, password }) {
    // 1. Buscar usuario por email
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new (require('../../entities/Usuario').AppError)('Credenciales inválidas', 401);
    }

    if (!usuario.activo) {
      throw new (require('../../entities/Usuario').AppError)('Cuenta desactivada', 401);
    }

    // 2. Verificar contraseña
    const passwordValida = await this.authService.comparePassword(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new (require('../../entities/Usuario').AppError)('Credenciales inválidas', 401);
    }

    // 3. Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await this.usuarioRepository.update(usuario.id, { ultimo_acceso: usuario.ultimoAcceso.toISOString() });

    // 4. Verificar si tiene perfil de perro
    const perro = await this.usuarioRepository.findPerroByUsuarioId(usuario.id);

    // 5. Generar tokens
    const tokenPayload = { id: usuario.id, email: usuario.email };
    const accessToken = this.authService.generarToken(tokenPayload);
    const refreshToken = this.authService.generarRefreshToken(tokenPayload);

    return {
      usuario: usuario.toJSON(),
      accessToken,
      refreshToken,
      tienePerro: !!perro,
    };
  }
}

module.exports = { AutenticarUsuario };
