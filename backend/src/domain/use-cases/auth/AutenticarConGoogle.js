// AutenticarConGoogle — Caso de uso: login/registro con Google
// Capa: domain/use-cases

const { Usuario } = require('../../entities/Usuario');

class AutenticarConGoogle {
  constructor(usuarioRepository, authService) {
    this.usuarioRepository = usuarioRepository;
    this.authService = authService;
  }

  async execute({ idToken }) {
    if (!idToken) {
      throw new (require('../../entities/Usuario').AppError)('Token de Google requerido', 400);
    }

    // Verificar el ID token contra Google
    let payload;
    try {
      const https = require('https');
      payload = await new Promise((resolve, reject) => {
        const url = new URL('https://oauth2.googleapis.com/tokeninfo');
        url.searchParams.set('id_token', idToken);
        https.get(url.toString(), (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) reject(new Error(parsed.error));
              else resolve(parsed);
            } catch (e) { reject(e); }
          });
        }).on('error', reject);
      });
    } catch (error) {
      throw new (require('../../entities/Usuario').AppError)('El token de Google no es válido', 401);
    }

    // Validar que el token corresponda a nuestra app
    const config = require('../../../config/env');
    if (payload.aud !== config.google.clientId) {
      throw new (require('../../entities/Usuario').AppError)('El token no corresponde a esta aplicación', 401);
    }

    if (!payload.email_verified) {
      throw new (require('../../entities/Usuario').AppError)('El correo de Google no está verificado', 400);
    }

    const email = payload.email;
    const nombre = payload.name || email.split('@')[0];

    // Buscar o crear usuario
    let usuario = await this.usuarioRepository.findByEmail(email);

    if (!usuario) {
      // Crear usuario nuevo (sin password, usa Google)
      usuario = Usuario.crear({
        nombre,
        email,
        passwordHash: 'Google', // marcador, no es password real
      });
      usuario = await this.usuarioRepository.save(usuario);
    } else if (!usuario.activo) {
      throw new (require('../../entities/Usuario').AppError)('Esta cuenta fue desactivada', 403);
    }

    // Actualizar último acceso
    usuario.ultimoAcceso = new Date();
    await this.usuarioRepository.update(usuario.id, { ultimo_acceso: usuario.ultimoAcceso.toISOString() });

    // Generar tokens JWT
    const tokenPayload = { id: usuario.id, email: usuario.email };
    const accessToken = this.authService.generarToken(tokenPayload);
    const refreshToken = this.authService.generarRefreshToken(tokenPayload);

    // Verificar si tiene perro registrado
    const perro = await this.usuarioRepository.findPerroByUsuarioId(usuario.id);

    return {
      usuario: usuario.toJSON(),
      accessToken,
      refreshToken,
      tienePerro: !!perro,
    };
  }
}

module.exports = { AutenticarConGoogle };
