// SupabaseMatchRepository — Implementación de MatchRepository con Supabase
// Capa: infrastructure/database/supabase

const { MatchRepository } = require('../../../domain/ports/repositories/MatchRepository');
const { Match } = require('../../../domain/entities/Match');
const { supabaseAdmin } = require('./client');

class SupabaseMatchRepository extends MatchRepository {
  async save(match) {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .insert({
        usuario_1: match.usuario1,
        usuario_2: match.usuario2,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Ya existe el match, lo devolvemos
        const existente = await this.findMatch(match.usuario1, match.usuario2);
        return existente;
      }
      throw new Error(`Error al crear match: ${error.message}`);
    }
    return this._mapear(data);
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Error al buscar match: ${error.message}`);
    return this._mapear(data);
  }

  async findByUsuario(usuarioId) {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('*')
      .or(`usuario_1.eq.${usuarioId},usuario_2.eq.${usuarioId}`)
      .eq('activo', true)
      .order('fecha_match', { ascending: false });

    if (error) throw new Error(`Error al buscar matches: ${error.message}`);
    return (data || []).map(d => this._mapear(d));
  }

  async findMatch(usuario1, usuario2) {
    const [u1, u2] = usuario1 < usuario2 ? [usuario1, usuario2] : [usuario2, usuario1];
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('usuario_1', u1)
      .eq('usuario_2', u2)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Error al buscar match: ${error.message}`);
    return this._mapear(data);
  }

  async findByUsuarioConDetalles(usuarioId) {
    // 1. Obtener matches básicos del usuario
    const matches = await this.findByUsuario(usuarioId);
    if (matches.length === 0) return [];

    // 2. IDs de los otros usuarios y de los matches
    const matchIds = [];
    const otrosIds = [];
    const matchOtroMap = {};
    matches.forEach(m => {
      matchIds.push(m.id);
      const otroId = m.usuario1 === usuarioId ? m.usuario2 : m.usuario1;
      otrosIds.push(otroId);
      matchOtroMap[m.id] = otroId;
    });

    // 3. Obtener perros de los otros usuarios
    const { data: perrosData, error: perrosError } = await supabaseAdmin
      .from('perros')
      .select('*')
      .in('usuario_id', otrosIds)
      .eq('activo', true);
    if (perrosError) throw new Error(`Error al obtener perros de matches: ${perrosError.message}`);

    const perrosMap = {};
    (perrosData || []).forEach(p => {
      perrosMap[p.usuario_id] = p;
    });

    // 4. Obtener mensajes de estos matches (ordenados descendente)
    const { data: mensajesData, error: msgsError } = await supabaseAdmin
      .from('mensajes')
      .select('match_id, texto, fecha, remitente_id, leido')
      .in('match_id', matchIds)
      .order('fecha', { ascending: false });
    if (msgsError) throw new Error(`Error al obtener mensajes de matches: ${msgsError.message}`);

    // Agrupar mensajes por match_id
    const mensajesPorMatch = {};
    matchIds.forEach(id => { mensajesPorMatch[id] = []; });
    (mensajesData || []).forEach(msg => {
      if (!mensajesPorMatch[msg.match_id]) mensajesPorMatch[msg.match_id] = [];
      mensajesPorMatch[msg.match_id].push(msg);
    });

    // 5. Armar resultado enriquecido
    return matches.map(m => {
      const otroId = matchOtroMap[m.id];
      const perroRow = perrosMap[otroId];
      const matchMsgs = mensajesPorMatch[m.id] || [];
      const ultimoMsg = matchMsgs.length > 0 ? matchMsgs[0] : null;
      const noLeidos = matchMsgs.filter(
        msg => msg.remitente_id !== usuarioId && !msg.leido
      ).length;

      const perroJson = perroRow ? {
        id: perroRow.id,
        usuarioId: perroRow.usuario_id,
        nombre: perroRow.nombre,
        raza: perroRow.raza,
        edadMeses: perroRow.edad_meses,
        sexo: perroRow.sexo,
        castrado: perroRow.castrado,
        descripcion: perroRow.descripcion,
        proposito: perroRow.proposito,
        latitud: parseFloat(perroRow.latitud),
        longitud: parseFloat(perroRow.longitud),
        fotoPrincipal: perroRow.foto_principal,
        fotos: perroRow.fotos || [],
        activo: perroRow.activo,
        creadoEn: perroRow.creado_en,
      } : null;

      return {
        ...m.toJSON(),
        perro: perroJson,
        tieneMensajes: matchMsgs.length > 0,
        ultimoMensaje: ultimoMsg ? ultimoMsg.texto : null,
        ultimoMensajeFecha: ultimoMsg ? ultimoMsg.fecha : null,
        mensajesNoLeidos: noLeidos,
      };
    });
  }

  async delete(id) {
    const { error } = await supabaseAdmin.from('matches').update({ activo: false }).eq('id', id);
    if (error) throw new Error(`Error al eliminar match: ${error.message}`);
  }

  _mapear(data) {
    if (!data) return null;
    return new Match({
      id: data.id,
      usuario1: data.usuario_1,
      usuario2: data.usuario_2,
      fechaMatch: data.fecha_match,
      activo: data.activo,
    });
  }
}

module.exports = { SupabaseMatchRepository };
