# Chat Realtime — Setup en Supabase Dashboard

Para que el chat funcione en tiempo real, hay que habilitar Realtime en Supabase.

## Paso 1: Habilitar Realtime en la tabla mensajes

1. Ve a **Supabase Dashboard** → `ordgfbmogvtdueiaqihy.supabase.co`
2. **Database → Replication**
3. En la sección **"Publications"**, haz clic en **"Create publication"**
   - Name: `supabase_realtime`
   - Source: `mensajes` (solo esta tabla)
   - Event: ✅ INSERT (solo eso necesitamos)

O alternativamente (más fácil):
1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta:
```sql
-- Habilitar Realtime para la tabla mensajes
alter publication supabase_realtime add table mensajes;
```

## Paso 2: RLS Policy para Realtime (opcional pero recomendado)

Si la tabla `mensajes` tiene RLS habilitado, necesitas una policy que permita leer mensajes solo si el usuario pertenece al match:

```sql
CREATE POLICY "Users can subscribe to their match messages"
ON public.mensajes
FOR SELECT
USING (
  match_id IN (
    SELECT id FROM matches 
    WHERE usuario1_id = auth.uid() OR usuario2_id = auth.uid()
  )
);
```

Esto asegura que nadie pueda escuchar mensajes de matches que no le corresponden.

## Paso 3: Verificar conexión

Una vez hecho, al abrir ChatScreen verás:
- 🟢 **"En vivo"** en el header si Realtime está conectado
- 🟡 **"Reconectando..."** si hay problemas
- Los mensajes aparecen instantáneamente sin polling cada 10s

## Si no funciona

- Revisa que la publicación `supabase_realtime` tenga `mensajes` habilitada
- Revisa que el RLS policy permita SELECT al usuario autenticado
- Revisa los logs de la app: mensajes como `[Chat] Suscribiendo a Realtime...` y `[Chat] 📩 Nuevo mensaje Realtime:`
