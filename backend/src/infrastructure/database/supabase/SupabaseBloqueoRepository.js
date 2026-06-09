const { BloqueoRepository } = require('../../../domain/ports/repositories/BloqueoRepository');
const { supabaseAdmin } = require('./client');

class SupabaseBloqueoRepository extends BloqueoRepository {
  async save({ usuarioId, bloqueadoId }) {
    const { error } = await supabaseAdmin
      .from('bloqueos')
      .insert({ usuario_id: usuarioId, bloqueado_id: bloqueadoId });

    if (error) {
      if (error.code === '23505') return; // ya bloqueado
      throw new Error(`Error al bloquear: ${error.message}`);
    }
  }

  async findBloqueo(usuarioId, bloqueadoId) {
    const { data, error } = await supabaseAdmin
      .from('bloqueos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('bloqueado_id', bloqueadoId)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Error al buscar bloqueo: ${error.message}`);
    return data;
  }

  async findBloqueados(usuarioId) {
    const { data, error } = await supabaseAdmin
      .from('bloqueos')
      .select('bloqueado_id')
      .eq('usuario_id', usuarioId);

    if (error) throw new Error(`Error al buscar bloqueados: ${error.message}`);
    return (data || []).map(d => d.bloqueado_id);
  }

  async findQuienMeBloqueo(usuarioId) {
    const { data, error } = await supabaseAdmin
      .from('bloqueos')
      .select('usuario_id')
      .eq('bloqueado_id', usuarioId);

    if (error) throw new Error(`Error al buscar quien bloqueo: ${error.message}`);
    return (data || []).map(d => d.usuario_id);
  }

  async delete(usuarioId, bloqueadoId) {
    const { error } = await supabaseAdmin
      .from('bloqueos')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('bloqueado_id', bloqueadoId);

    if (error) throw new Error(`Error al desbloquear: ${error.message}`);
  }
}

module.exports = { SupabaseBloqueoRepository };
