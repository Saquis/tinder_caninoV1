// SupabaseUsuarioRepository — Implementación de UsuarioRepository con Supabase
// Capa: infrastructure/database/supabase

const { UsuarioRepository } = require('../../../domain/ports/repositories/UsuarioRepository');
const { Usuario } = require('../../../domain/entities/Usuario');
const { supabaseAdmin } = require('./client');

class SupabaseUsuarioRepository extends UsuarioRepository {
  async save(usuario) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        nombre: usuario.nombre,
        email: usuario.email,
        password_hash: usuario.passwordHash,
        telefono: usuario.telefono,
        ciudad: usuario.ciudad,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    return this._mapear(data);
  }

  async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code === 'PGRST116') return null; // no encontrado
    if (error) throw new Error(`Error al buscar usuario: ${error.message}`);

    return this._mapear(data);
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Error al buscar usuario: ${error.message}`);

    return this._mapear(data);
  }

  async update(id, cambios) {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar usuario: ${error.message}`);

    return this._mapear(data);
  }

  async delete(id) {
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar usuario: ${error.message}`);
  }

  async findPerroByUsuarioId(usuarioId) {
    const { data, error } = await supabaseAdmin
      .from('perros')
      .select('id')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    if (error) throw new Error(`Error al buscar perro: ${error.message}`);
    return data;
  }

  _mapear(data) {
    if (!data) return null;
    return new Usuario({
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      passwordHash: data.password_hash,
      telefono: data.telefono,
      ciudad: data.ciudad,
      premium: data.premium,
      fechaRegistro: data.fecha_registro,
      ultimoAcceso: data.ultimo_acceso,
      activo: data.activo,
    });
  }
}

module.exports = { SupabaseUsuarioRepository };
