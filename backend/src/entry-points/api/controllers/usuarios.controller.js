// Usuarios Controller — Perfil, reportes, bloqueos
// Capa: entry-points/api/controllers

function crearUsuariosController(usuarioRepository, reporteRepository, bloqueoRepository) {
  return {
    async perfil(req, res, next) {
      try {
        const usuario = await usuarioRepository.findById(req.usuario.id);
        if (!usuario) return res.status(404).json({ error: { message: 'Usuario no encontrado' } });
        res.json(usuario.toJSON());
      } catch (e) { next(e); }
    },

    async actualizar(req, res, next) {
      try {
        const campos = {};
        if (req.body.nombre !== undefined) campos.nombre = req.body.nombre;
        if (req.body.telefono !== undefined) campos.telefono = req.body.telefono;
        if (req.body.ciudad !== undefined) campos.ciudad = req.body.ciudad;
        const actualizado = await usuarioRepository.update(req.usuario.id, campos);
        res.json(actualizado.toJSON());
      } catch (e) { next(e); }
    },

    async eliminar(req, res, next) {
      try {
        await usuarioRepository.delete(req.usuario.id);
        res.json({ message: 'Cuenta desactivada' });
      } catch (e) { next(e); }
    },

    async reportar(req, res, next) {
      try {
        const { reportadoId, motivo, descripcion } = req.body;
        if (req.usuario.id === reportadoId) return res.status(400).json({ error: { message: 'No puedes reportarte a ti mismo' } });
        await reporteRepository.save({ reportanteId: req.usuario.id, reportadoId, motivo, descripcion });
        res.status(201).json({ message: 'Reporte enviado' });
      } catch (e) { next(e); }
    },

    async bloquear(req, res, next) {
      try {
        const { bloqueadoId } = req.body;
        if (req.usuario.id === bloqueadoId) return res.status(400).json({ error: { message: 'No puedes bloquearte a ti mismo' } });
        await bloqueoRepository.save({ usuarioId: req.usuario.id, bloqueadoId });
        res.status(201).json({ message: 'Usuario bloqueado' });
      } catch (e) { next(e); }
    },

    async desbloquear(req, res, next) {
      try {
        await bloqueoRepository.delete(req.usuario.id, req.params.bloqueadoId);
        res.json({ message: 'Usuario desbloqueado' });
      } catch (e) { next(e); }
    },

    async bloqueados(req, res, next) {
      try {
        const ids = await bloqueoRepository.findBloqueados(req.usuario.id);
        res.json({ bloqueados: ids });
      } catch (e) { next(e); }
    },
  };
}

module.exports = { crearUsuariosController };
