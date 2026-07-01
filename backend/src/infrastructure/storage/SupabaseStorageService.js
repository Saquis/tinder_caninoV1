// SupabaseStorageService — Adaptador para subir archivos a Supabase Storage
// Capa: infrastructure/storage

const { createClient } = require('@supabase/supabase-js');
const config = require('../../config/env');

// WebSocket para Node < 22
let wsTransport;
try {
  wsTransport = require('ws');
} catch {
  wsTransport = undefined;
}

class SupabaseStorageService {
  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.serviceKey, {
      realtime: wsTransport ? { transport: wsTransport } : {},
    });
    this.bucket = 'fotos-perros';
  }

  async subirFoto(perroId, archivo) {
    const timestamp = Date.now();
    const extension = archivo.originalname.split('.').pop() || 'jpg';
    const filePath = `${perroId}/${timestamp}.${extension}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: true,
      });

    if (error) throw new Error(`Error al subir foto: ${error.message}`);

    // Obtener URL pública
    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  }

  async eliminarFoto(filePath) {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) throw new Error(`Error al eliminar foto: ${error.message}`);
  }
}

module.exports = { SupabaseStorageService };
