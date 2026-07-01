// Auth Controller — Maneja peticiones HTTP de autenticación
// Capa: entry-points/api/controllers

const { RegistrarUsuario } = require('../../../domain/use-cases/auth/RegistrarUsuario');
const { AutenticarUsuario } = require('../../../domain/use-cases/auth/AutenticarUsuario');
const { AutenticarConGoogle } = require('../../../domain/use-cases/auth/AutenticarConGoogle');
const { RenovarToken } = require('../../../domain/use-cases/auth/RenovarToken');

function crearAuthController(usuarioRepository, authService, refreshTokenRepository) {
  const registrar = new RegistrarUsuario(usuarioRepository, authService, refreshTokenRepository);
  const autenticar = new AutenticarUsuario(usuarioRepository, authService);
  const googleAuth = new AutenticarConGoogle(usuarioRepository, authService);
  const renovar = new RenovarToken(usuarioRepository, authService, refreshTokenRepository);

  return {
    async registro(req, res, next) {
      try {
        const { nombre, email, password, telefono, ciudad } = req.body;
        const resultado = await registrar.execute({ nombre, email, password, telefono, ciudad });
        res.status(201).json(resultado);
      } catch (error) { next(error); }
    },

    async login(req, res, next) {
      try {
        const { email, password } = req.body;
        const resultado = await autenticar.execute({ email, password });
        res.json(resultado);
      } catch (error) { next(error); }
    },

    async refresh(req, res, next) {
      try {
        const { refreshToken } = req.body;
        const resultado = await renovar.execute({ refreshToken });
        res.json(resultado);
      } catch (error) { next(error); }
    },

    async googleLogin(req, res, next) {
      try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: { message: 'Token de Google requerido' } });
        const resultado = await googleAuth.execute({ idToken });
        res.json(resultado);
      } catch (error) { next(error); }
    },

    async logout(req, res, next) {
      try {
        const { refreshToken } = req.body;
        await renovar.logout({ refreshToken, usuarioId: req.usuario.id });
        // También invalidar otros tokens del mismo usuario
        if (!refreshToken) {
          await refreshTokenRepository.deleteByUsuario(req.usuario.id);
        }
        res.json({ message: 'Sesión cerrada' });
      } catch (error) { next(error); }
    },
  };
}

module.exports = { crearAuthController };
