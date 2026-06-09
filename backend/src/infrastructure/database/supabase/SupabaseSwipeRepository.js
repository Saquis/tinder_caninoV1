// SupabaseSwipeRepository — Implementación de SwipeRepository con Supabase
// Capa: infrastructure/database/supabase

const { SwipeRepository } = require('../../../domain/ports/repositories/SwipeRepository');
const { Swipe } = require('../../../domain/entities/Swipe');
const { supabaseAdmin } = require('./client');

class SupabaseSwipeRepository extends SwipeRepository {
  async save(swipe) {
    const { data, error } = await supabaseAdmin
      .from('swipes')
      .insert({
        usuario_origen: swipe.usuarioOrigen,
        usuario_destino: swipe.usuarioDestino,
        tipo: swipe.tipo,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new (require('../../../domain/entities/Usuario').AppError)('Ya swipeaste a este usuario', 409);
      throw new Error(`Error al guardar swipe: ${error.message}`);
    }
    return new Swipe({ id: data.id, usuarioOrigen: data.usuario_origen, usuarioDestino: data.usuario_destino, tipo: data.tipo, fecha: data.fecha });
  }

  async findByUsuarioOrigen(usuarioId) {
    const { data, error } = await supabaseAdmin
      .from('swipes')
      .select('*')
      .eq('usuario_origen', usuarioId);

    if (error) throw new Error(`Error al buscar swipes: ${error.message}`);
    return (data || []).map(s => new Swipe({ id: s.id, usuarioOrigen: s.usuario_origen, usuarioDestino: s.usuario_destino, tipo: s.tipo, fecha: s.fecha }));
  }

  async findSwipe(usuarioOrigen, usuarioDestino) {
    const { data, error } = await supabaseAdmin
      .from('swipes')
      .select('*')
      .eq('usuario_origen', usuarioOrigen)
      .eq('usuario_destino', usuarioDestino)
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw new Error(`Error al buscar swipe: ${error.message}`);
    return new Swipe({ id: data.id, usuarioOrigen: data.usuario_origen, usuarioDestino: data.usuario_destino, tipo: data.tipo, fecha: data.fecha });
  }

  async countSwipesToday(usuarioId) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { count, error } = await supabaseAdmin
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_origen', usuarioId)
      .gte('fecha', hoy.toISOString())
      .in('tipo', ['like', 'super']);

    if (error) throw new Error(`Error al contar swipes: ${error.message}`);
    return count || 0;
  }
}

module.exports = { SupabaseSwipeRepository };
