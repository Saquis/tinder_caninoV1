const { ReporteRepository } = require('../../../domain/ports/repositories/ReporteRepository');
const { supabaseAdmin } = require('./client');

class SupabaseReporteRepository extends ReporteRepository {
  async save({ reportanteId, reportadoId, motivo, descripcion }) {
    const { error } = await supabaseAdmin
      .from('reportes')
      .insert({ reportante_id: reportanteId, reportado_id: reportadoId, motivo, descripcion });

    if (error) throw new Error(`Error al reportar: ${error.message}`);
  }
}

module.exports = { SupabaseReporteRepository };
