// Auth Middleware — Verifica JWT en headers
// Capa: entry-points/api/middleware

function crearAuthMiddleware(authService) {
  return {
    // Middleware: requiere token válido
    requiereAuth(req, res, next) {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: { message: 'Token no proporcionado' } });
      }

      const token = header.split(' ')[1];
      const payload = authService.verificarToken(token);

      if (!payload) {
        return res.status(401).json({ error: { message: 'Token inválido o expirado' } });
      }

      req.usuario = payload; // { id, email }
      next();
    },

    // Middleware: requiere ser premium
    requierePremium(req, res, next) {
      if (!req.usuario || !req.usuario.premium) {
        return res.status(403).json({ error: { message: 'Se requiere cuenta premium' } });
      }
      next();
    },
  };
}

module.exports = { crearAuthMiddleware };
