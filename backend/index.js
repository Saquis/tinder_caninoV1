// Index — Punto de entrada para arrancar el servidor
const config = require('./src/config/env');
const { crearApp } = require('./src/entry-points/api/server');

const app = crearApp();
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`✅ TinderCanino API corriendo en puerto ${PORT} [${config.nodeEnv}]`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth`);
});
