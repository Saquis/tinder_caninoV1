-- TinderCanino — Schema Inicial
-- Ejecutar en Supabase SQL Editor

-- 1. Usuarios (dueños de perros)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  ciudad VARCHAR(100),
  premium BOOLEAN DEFAULT false,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultimo_acceso TIMESTAMP,
  activo BOOLEAN DEFAULT true
);

-- 2. Perfiles de perros
CREATE TABLE IF NOT EXISTS perros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  raza VARCHAR(100),
  edad_meses INTEGER,
  sexo VARCHAR(10) CHECK (sexo IN ('macho', 'hembra')),
  castrado BOOLEAN DEFAULT false,
  descripcion TEXT,
  proposito VARCHAR(50) CHECK (proposito IN ('jugar', 'pasear', 'reproduccion', 'todo')),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  foto_principal VARCHAR(500),
  fotos JSONB DEFAULT '[]',
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- 3. Swipes (likes y nopes)
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_origen UUID REFERENCES usuarios(id),
  usuario_destino UUID REFERENCES usuarios(id),
  tipo VARCHAR(10) CHECK (tipo IN ('like', 'nope', 'super')),
  fecha TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_origen, usuario_destino)
);

-- 4. Matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_1 UUID REFERENCES usuarios(id),
  usuario_2 UUID REFERENCES usuarios(id),
  fecha_match TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT true,
  UNIQUE(usuario_1, usuario_2)
);

-- 5. Mensajes de chat
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  remitente_id UUID REFERENCES usuarios(id),
  texto TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  fecha TIMESTAMP DEFAULT NOW()
);

-- 6. Reportes
CREATE TABLE IF NOT EXISTS reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reportante_id UUID REFERENCES usuarios(id),
  reportado_id UUID REFERENCES usuarios(id),
  motivo VARCHAR(255),
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT NOW()
);

-- 7. Bloqueos
CREATE TABLE IF NOT EXISTS bloqueos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  bloqueado_id UUID REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, bloqueado_id)
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_perros_usuario ON perros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_perros_activo ON perros(activo);
CREATE INDEX IF NOT EXISTS idx_swipes_origen ON swipes(usuario_origen);
CREATE INDEX IF NOT EXISTS idx_matches_usuarios ON matches(usuario_1, usuario_2);
CREATE INDEX IF NOT EXISTS idx_mensajes_match ON mensajes(match_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Row Level Security (opcional, para cuando se use el anon key desde frontend)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perros ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: el service_role (backend) tiene acceso total
-- El anon key solo puede leer perfiles de perros activos
CREATE POLICY "Perros visibles para todos" ON perros
  FOR SELECT USING (activo = true);

-- 8. Refresh tokens (para logout/invalidación)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario ON refresh_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
