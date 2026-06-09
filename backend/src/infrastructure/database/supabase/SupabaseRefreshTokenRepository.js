const { RefreshTokenRepository } = require('../../../domain/ports/repositories/RefreshTokenRepository');
const { supabaseAdmin } = require('./client');

class SupabaseRefreshTokenRepository extends RefreshTokenRepository {
  async save({ usuarioId, token, expiresAt }) {
    const { error } = await supabaseAdmin
      .from('refresh_tokens')
      .insert({ usuario_id: usuarioId, token, expires_at: expiresAt });

    if (error) throw new Error(`Error al guardar refresh token: ${error.message}`);
  }

  async find(token) {
    const { data, error } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Error al buscar refresh token: ${error.message}`);
    return data;
  }

  async deleteByUsuario(usuarioId) {
    const { error } = await supabaseAdmin.from('refresh_tokens').delete().eq('usuario_id', usuarioId);
    if (error) throw new Error(`Error al eliminar refresh tokens: ${error.message}`);
  }

  async delete(token) {
    const { error } = await supabaseAdmin.from('refresh_tokens').delete().eq('token', token);
    if (error) throw new Error(`Error al eliminar refresh token: ${error.message}`);
  }
}

module.exports = { SupabaseRefreshTokenRepository };
