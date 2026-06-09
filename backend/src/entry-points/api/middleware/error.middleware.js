// Error Middleware — Manejo global de errores
// Capa: entry-points/api/middleware

function errorMiddleware(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : 'Error interno del servidor';

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

module.exports = { errorMiddleware };
