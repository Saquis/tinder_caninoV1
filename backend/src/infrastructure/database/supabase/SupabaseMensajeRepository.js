// SupabaseMensajeRepository — Implementación de MensajeRepository con Supabase
// Capa: infrastructure/database/supabase

const { MensajeRepository } = require('../../../domain/ports/repositories/MensajeRepository');
const { Mensaje } = require('../../../domain/entities/Mensaje');
const { supabaseAdmin } = require('./client');

class SupabaseMensajeRepository extends MensajeRepository {
  async save(mensaje) {
    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .insert({ match_id: mensaje.matchId, remitente_id: mensaje.remitenteId, texto: mensaje.texto })
      .select()
      .single();

    if (error) throw new Error(`Error al enviar mensaje: ${error.message}`);
    return this._mapear(data);
  }

  async findByMatchId(matchId, { offset = 0, limite = 50 }) {
    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .select('*')
      .eq('match_id', matchId)
      .order('fecha', { ascending: false })
      .range(offset, offset + limite - 1);

    if (error) throw new Error(`Error al obtener mensajes: ${error.message}`);
    return (data || []).reverse().map(d => this._mapear(d));
  }

  async marcarLeidos(matchId, usuarioId) {
    const { error } = await supabaseAdmin
      .from('mensajes')
      .update({ leido: true })
      .eq('match_id', matchId)
      .neq('remitente_id', usuarioId)
      .eq('leido', false);

    if (error) throw new Error(`Error al marcar leídos: ${error.message}`);
  }

  _mapear(data) {
    if (!data) return null;
    return new Mensaje({
      id: data.id,
      matchId: data.match_id,
      remitenteId: data.remitente_id,
      texto: data.texto,
      leido: data.leido,
      fecha: data.fecha,
    });
  }
}

module.exports = { SupabaseMensajeRepository };
