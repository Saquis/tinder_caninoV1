// SupabasePerroRepository — Implementación de PerroRepository con Supabase
// Capa: infrastructure/database/supabase

const { PerroRepository } = require('../../../domain/ports/repositories/PerroRepository');
const { Perro } = require('../../../domain/entities/Perro');
const { supabaseAdmin } = require('./client');

class SupabasePerroRepository extends PerroRepository {
  async save(perro) {
    const { data, error } = await supabaseAdmin
      .from('perros')
      .insert({
        usuario_id: perro.usuarioId,
        nombre: perro.nombre,
        raza: perro.raza,
        edad_meses: perro.edadMeses,
        sexo: perro.sexo,
        castrado: perro.castrado,
        descripcion: perro.descripcion,
        proposito: perro.proposito,
        latitud: perro.latitud,
        longitud: perro.longitud,
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear perro: ${error.message}`);
    return this._mapear(data);
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin.from('perros').select('*').eq('id', id).eq('activo', true).single();
    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Error al buscar perro: ${error.message}`);
    return this._mapear(data);
  }

  async findByUsuarioId(usuarioId) {
    const { data, error } = await supabaseAdmin
      .from('perros')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('activo', true)
      .order('creado_en', { ascending: true });

    if (error) throw new Error(`Error al buscar perros por usuario: ${error.message}`);
    return (data || []).map(r => this._mapear(r));
  }

  async findCercanos({ latitud, longitud, distanciaKm, excluirIds = [], limite = 20, offset = 0, proposito, raza, edadMax }) {
    let query = supabaseAdmin
      .from('perros')
      .select('*', { count: 'exact' })
      .eq('activo', true)
      .order('creado_en', { ascending: false })
      .range(offset, offset + limite - 1);

    if (excluirIds.length > 0) {
      query = query.not('usuario_id', 'in', `(${excluirIds.map(id => `"${id}"`).join(',')})`);
    }

    if (proposito) {
      query = query.eq('proposito', proposito);
    }
    if (raza) {
      query = query.ilike('raza', `%${raza}%`);
    }
    if (edadMax !== undefined) {
      query = query.lte('edad_meses', edadMax);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(`Error al explorar perros: ${error.message}`);
    return {
      perros: (data || []).map(d => this._mapear(d)).filter(Boolean),
      total: count || 0,
    };
  }

  async update(id, cambios) {
    const cambiosMapeados = {};
    if (cambios.nombre !== undefined) cambiosMapeados.nombre = cambios.nombre;
    if (cambios.raza !== undefined) cambiosMapeados.raza = cambios.raza;
    if (cambios.edadMeses !== undefined) cambiosMapeados.edad_meses = cambios.edadMeses;
    if (cambios.sexo !== undefined) cambiosMapeados.sexo = cambios.sexo;
    if (cambios.castrado !== undefined) cambiosMapeados.castrado = cambios.castrado;
    if (cambios.descripcion !== undefined) cambiosMapeados.descripcion = cambios.descripcion;
    if (cambios.proposito !== undefined) cambiosMapeados.proposito = cambios.proposito;
    if (cambios.latitud !== undefined) cambiosMapeados.latitud = cambios.latitud;
    if (cambios.longitud !== undefined) cambiosMapeados.longitud = cambios.longitud;
    if (cambios.fotoPrincipal !== undefined) cambiosMapeados.foto_principal = cambios.fotoPrincipal;
    if (cambios.fotos !== undefined) cambiosMapeados.fotos = cambios.fotos;

    // Si no hay cambios, no ejecutar query
    if (Object.keys(cambiosMapeados).length === 0) {
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('perros')
      .update(cambiosMapeados)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar perro: ${error.message}`);
    return this._mapear(data);
  }

  async delete(id) {
    const { error } = await supabaseAdmin.from('perros').update({ activo: false }).eq('id', id);
    if (error) throw new Error(`Error al eliminar perro: ${error.message}`);
  }

  _mapear(data) {
    if (!data) return null;
    return new Perro({
      id: data.id,
      usuarioId: data.usuario_id,
      nombre: data.nombre,
      raza: data.raza,
      edadMeses: data.edad_meses,
      sexo: data.sexo,
      castrado: data.castrado,
      descripcion: data.descripcion,
      proposito: data.proposito,
      latitud: data.latitud,
      longitud: data.longitud,
      fotoPrincipal: data.foto_principal,
      fotos: data.fotos || [],
      activo: data.activo,
      creadoEn: data.creado_en,
    });
  }
}

module.exports = { SupabasePerroRepository };
