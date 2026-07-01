// Perros Routes — Definiciones de rutas de perfiles de perros
// Capa: entry-points/api/routes

const { Router } = require('express');
const multer = require('multer');
const { crearPerrosController } = require('../controllers/perros.controller');
const { crearAuthMiddleware } = require('../middleware/auth.middleware');

// Configurar multer en memoria (no guarda en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'), false);
    }
  },
});

function crearPerrosRoutes(perroRepository, swipeRepository, bloqueoRepository, authService, storageService) {
  const router = Router();
  const controller = crearPerrosController(perroRepository, swipeRepository, bloqueoRepository, storageService);
  const auth = crearAuthMiddleware(authService);

  router.post('/', auth.requiereAuth, upload.single('foto'), controller.crearPerro);
  router.get('/mi-perro', auth.requiereAuth, controller.miPerro);
  router.get('/mis-perros', auth.requiereAuth, controller.misPerros);
  router.get('/explorar', auth.requiereAuth, controller.explorar);
  router.put('/:id', auth.requiereAuth, controller.actualizarPerro);
  router.put('/:id/ubicacion', auth.requiereAuth, controller.actualizarUbicacion);
  router.post('/:id/fotos', auth.requiereAuth, upload.single('foto'), controller.subirFoto);
  router.delete('/:id/fotos/:fotoId', auth.requiereAuth, controller.eliminarFoto);
  router.put('/:id/fotos/:fotoId/portada', auth.requiereAuth, controller.establecerPortada);
  router.delete('/:id', auth.requiereAuth, controller.eliminarPerro);

  return router;
}

module.exports = { crearPerrosRoutes };
