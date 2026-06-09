// Perros Controller — Maneja peticiones HTTP de perfiles de perros
// Capa: entry-points/api/controllers

const { CrearPerfilPerro } = require('../../../domain/use-cases/perros/CrearPerfilPerro');
const { ActualizarPerro } = require('../../../domain/use-cases/perros/ActualizarPerro');
const { ExplorarPerros } = require('../../../domain/use-cases/perros/ExplorarPerros');

function crearPerrosController(perroRepository, swipeRepository, bloqueoRepository, storageService) {
  const crear = new CrearPerfilPerro(perroRepository);
  const actualizar = new ActualizarPerro(perroRepository);
  const explorar = new ExplorarPerros(perroRepository, swipeRepository);

  return {
    async crearPerro(req, res, next) {
      try {
        const resultado = await crear.execute({ usuarioId: req.usuario.id, ...req.body });

        // Si viene una foto en la creación, subirla
        if (req.file) {
          try {
            const foto = await storageService.subirFoto(resultado.id, req.file);
            await perroRepository.update(resultado.id, { fotoPrincipal: foto.url });
            resultado.fotoPrincipal = foto.url;
          } catch (e) {
            console.error('Error al subir foto en creación:', e.message);
            // No fallar la creación si la foto no se sube
          }
        }

        res.status(201).json(resultado);
      } catch (e) { next(e); }
    },

    async miPerro(req, res, next) {
      try {
        const perro = await perroRepository.findByUsuarioId(req.usuario.id);
        if (!perro) return res.status(404).json({ error: { message: 'No tienes un perro registrado' } });
        res.json(perro.toJSON());
      } catch (e) { next(e); }
    },

    async actualizarPerro(req, res, next) {
      try {
        const resultado = await actualizar.execute({ id: req.params.id, usuarioId: req.usuario.id, cambios: req.body });
        res.json(resultado);
      } catch (e) { next(e); }
    },

    async explorar(req, res, next) {
      try {
        const { latitud, longitud, pagina } = req.query;
        const misBloqueados = await bloqueoRepository.findBloqueados(req.usuario.id);
        const meBloquearon = await bloqueoRepository.findQuienMeBloqueo(req.usuario.id);
        const todosBloqueados = [...new Set([...misBloqueados, ...meBloquearon])];

        const resultado = await explorar.execute({
          usuarioId: req.usuario.id,
          latitud: parseFloat(latitud) || null,
          longitud: parseFloat(longitud) || null,
          pagina: parseInt(pagina, 10) || 0,
          bloqueadosIds: todosBloqueados,
        });
        res.json(resultado);
      } catch (e) { next(e); }
    },

    async eliminarPerro(req, res, next) {
      try {
        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) return res.status(403).json({ error: { message: 'No tienes permiso' } });
        await perroRepository.delete(req.params.id);
        res.json({ message: 'Perro eliminado' });
      } catch (e) { next(e); }
    },

    async subirFoto(req, res, next) {
      try {
        // Verificar que el perro existe y pertenece al usuario
        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) return res.status(403).json({ error: { message: 'No tienes permiso' } });

        if (!req.file) return res.status(400).json({ error: { message: 'No se envió ninguna imagen' } });

        // Limitar tamaño: multer ya lo hace, pero validación extra
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({ error: { message: 'La imagen no puede superar 5MB' } });
        }

        const foto = await storageService.subirFoto(perro.id, req.file);

        // Actualizar fotoPrincipal del perro (la última foto subida es la principal)
        await perroRepository.update(perro.id, { fotoPrincipal: foto.url });

        res.json({ url: foto.url, path: foto.path });
      } catch (e) { next(e); }
    },

    async eliminarFoto(req, res, next) {
      try {
        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) return res.status(403).json({ error: { message: 'No tienes permiso' } });

        // Si la foto es la principal, limpiarla
        if (perro.fotoPrincipal && perro.fotoPrincipal.includes(req.params.fotoId)) {
          await perroRepository.update(perro.id, { fotoPrincipal: null });
        }

        await storageService.eliminarFoto(req.params.fotoId);
        res.json({ message: 'Foto eliminada' });
      } catch (e) { next(e); }
    },

    async actualizarUbicacion(req, res, next) {
      try {
        const { latitud, longitud } = req.body;
        const perro = await perroRepository.findByUsuarioId(req.usuario.id);
        if (!perro) return res.status(404).json({ error: { message: 'No tienes un perro registrado' } });
        await perroRepository.update(perro.id, { latitud, longitud });
        res.json({ message: 'Ubicación actualizada' });
      } catch (e) { next(e); }
    },
  };
}

module.exports = { crearPerrosController };
