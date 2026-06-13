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
        console.log('[PerrosController] crearPerro → usuario:', req.usuario.id);
        const resultado = await crear.execute({ usuarioId: req.usuario.id, ...req.body });

        // Si viene una foto en la creación, subirla
        if (req.file) {
          try {
            console.log('[PerrosController] Subiendo foto de creación...');
            const foto = await storageService.subirFoto(resultado.id, req.file);
            console.log('[PerrosController] Foto subida:', foto.url);
            // Guardar en el array de fotos también
            await perroRepository.update(resultado.id, {
              fotoPrincipal: foto.url,
              fotos: [foto],
            });
            resultado.fotoPrincipal = foto.url;
          } catch (e) {
            console.error('[PerrosController] Error al subir foto en creación:', e.message);
          }
        }

        res.status(201).json(resultado);
      } catch (e) { next(e); }
    },

    async miPerro(req, res, next) {
      try {
        console.log('[PerrosController] miPerro → usuario:', req.usuario.id);
        const perro = await perroRepository.findByUsuarioId(req.usuario.id);
        if (!perro) return res.status(404).json({ error: { message: 'No tienes un perro registrado' } });
        res.json(perro.toJSON());
      } catch (e) { next(e); }
    },

    async explorar(req, res, next) {
      try {
        const { pagina, proposito, raza, edadMax } = req.query;
        const resultado = await explorar.execute({
          usuarioId: req.usuario.id,
          pagina: parseInt(pagina, 10) || 0,
          filtros: { proposito, raza, edadMax: edadMax ? parseInt(edadMax, 10) : undefined },
        });
        res.json(resultado);
      } catch (e) { next(e); }
    },

    async actualizarPerro(req, res, next) {
      try {
        console.log('[PerrosController] actualizarPerro → perro:', req.params.id);
        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) {
          return res.status(403).json({ error: { message: 'No tienes permiso para modificar este perro' } });
        }
        const resultado = await actualizar.execute({ id: req.params.id, ...req.body });
        res.json(resultado.toJSON());
      } catch (e) { next(e); }
    },

    async subirFoto(req, res, next) {
      try {
        console.log('[PerrosController] subirFoto → perro:', req.params.id, 'usuario:', req.usuario.id);

        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) {
          return res.status(403).json({ error: { message: 'No tienes permiso' } });
        }

        if (!req.file) return res.status(400).json({ error: { message: 'No se envió ninguna imagen' } });
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({ error: { message: 'La imagen no puede superar 5MB' } });
        }

        const foto = await storageService.subirFoto(perro.id, req.file);
        console.log('[PerrosController] Foto subida:', foto.url);

        // Agregar al array de fotos
        const fotosActuales = [...(perro.fotos || [])];
        fotosActuales.push(foto);

        // Si es la primera foto, establecerla como principal
        const updates = { fotos: fotosActuales };
        if (!perro.fotoPrincipal) {
          updates.fotoPrincipal = foto.url;
        }

        await perroRepository.update(perro.id, updates);
        console.log('[PerrosController] Array fotos actualizado:', fotosActuales.length, 'fotos');

        res.json({ url: foto.url, path: foto.path, fotosActuales: fotosActuales.length });
      } catch (e) { next(e); }
    },

    async eliminarFoto(req, res, next) {
      try {
        console.log('[PerrosController] eliminarFoto → perro:', req.params.id, 'fotoId:', req.params.fotoId);

        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) {
          return res.status(403).json({ error: { message: 'No tienes permiso' } });
        }

        // Buscar la foto en el array de fotos del perro
        const fotoIndex = (perro.fotos || []).findIndex(f => f.path === req.params.fotoId);
        if (fotoIndex === -1) {
          console.warn('[PerrosController] Foto no encontrada en array, intentando eliminar igual');
        }

        // Eliminar del Storage
        await storageService.eliminarFoto(req.params.fotoId);
        console.log('[PerrosController] Foto eliminada de Storage');

        // Actualizar array de fotos en DB
        const fotosActualizadas = (perro.fotos || []).filter(f => f.path !== req.params.fotoId);
        const updates = { fotos: fotosActualizadas };

        // Si la foto eliminada era la principal, buscar nueva principal
        if (perro.fotoPrincipal && perro.fotoPrincipal.includes(req.params.fotoId)) {
          if (fotosActualizadas.length > 0 && fotosActualizadas[0]?.url) {
            updates.fotoPrincipal = fotosActualizadas[0].url;
            console.log('[PerrosController] Nueva foto principal:', updates.fotoPrincipal);
          } else {
            updates.fotoPrincipal = null;
            console.log('[PerrosController] Sin fotos restantes, fotoPrincipal = null');
          }
        }

        await perroRepository.update(perro.id, updates);
        console.log('[PerrosController] Array fotos actualizado en DB');

        res.json({
          message: 'Foto eliminada',
          fotosRestantes: fotosActualizadas.length,
          fotoPrincipal: updates.fotoPrincipal || perro.fotoPrincipal,
        });
      } catch (e) { next(e); }
    },

    async establecerPortada(req, res, next) {
      try {
        console.log('[PerrosController] establecerPortada → perro:', req.params.id, 'fotoId:', req.params.fotoId);

        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) {
          return res.status(403).json({ error: { message: 'No tienes permiso' } });
        }

        // Buscar la foto por su path
        const foto = (perro.fotos || []).find(f => f.path === req.params.fotoId);
        if (!foto) {
          return res.status(404).json({ error: { message: 'Foto no encontrada en este perro' } });
        }

        // Actualizar fotoPrincipal
        await perroRepository.update(perro.id, { fotoPrincipal: foto.url });
        console.log('[PerrosController] Portada establecida:', foto.url);

        res.json({
          message: 'Foto principal actualizada',
          fotoPrincipal: foto.url,
        });
      } catch (e) { next(e); }
    },

    async actualizarUbicacion(req, res, next) {
      try {
        console.log('[PerrosController] actualizarUbicacion → usuario:', req.usuario.id);
        const { latitud, longitud } = req.body;
        const perro = await perroRepository.findByUsuarioId(req.usuario.id);
        if (!perro) return res.status(404).json({ error: { message: 'No tienes un perro registrado' } });
        await perroRepository.update(perro.id, { latitud, longitud });
        console.log('[PerrosController] Ubicación actualizada:', latitud, longitud);
        res.json({ message: 'Ubicación actualizada' });
      } catch (e) { next(e); }
    },

    async eliminarPerro(req, res, next) {
      try {
        console.log('[PerrosController] eliminarPerro → perro:', req.params.id);
        const perro = await perroRepository.findById(req.params.id);
        if (!perro) return res.status(404).json({ error: { message: 'Perro no encontrado' } });
        if (perro.usuarioId !== req.usuario.id) {
          return res.status(403).json({ error: { message: 'No tienes permiso' } });
        }

        // Eliminar fotos del storage
        for (const foto of perro.fotos || []) {
          try {
            await storageService.eliminarFoto(foto.path);
            console.log('[PerrosController] Foto eliminada:', foto.path);
          } catch (e) {
            console.error('[PerrosController] Error al eliminar foto:', foto.path, e.message);
          }
        }

        await perroRepository.delete(req.params.id);
        console.log('[PerrosController] Perro eliminado');
        res.json({ message: 'Perro eliminado' });
      } catch (e) { next(e); }
    },
  };
}

module.exports = { crearPerrosController };
