// PrivacyScreen — Política de Privacidad con LOPDP Ecuador
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows } from '../styles/theme';

export default function PrivacyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerIcon}>🐾</Text>
          <Text style={styles.headerTitle}>Política de Privacidad</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.fecha}>Última actualización: 14 de junio de 2026</Text>

        <Section title="1. Información que recopilamos">
          Para operar TinderCanino, recopilamos los siguientes datos:
        </Section>
        <Bullet icon="badge" text="Información de registro: nombre, correo electrónico, contraseña cifrada con bcrypt" />
        <Bullet icon="pets" text="Información del perfil del perro: nombre, raza, edad, sexo, fotos, descripción" />
        <Bullet icon="location-on" text="Ubicación geográfica: coordenadas GPS para mostrar perros cercanos (no almacenamos historial de ubicación)" />
        <Bullet icon="swipe" text="Interacciones: swipes, matches, mensajes de chat" />
        <Bullet icon="flag" text="Reportes y bloqueos" />

        <Section title="2. Cómo usamos tu información">
          <Bullet icon="visibility" text="Mostrar perfiles de perros cercanos según tu ubicación" />
          <Bullet icon="favorite" text="Emparejarte con otros usuarios (sistema de match)" />
          <Bullet icon="chat" text="Permitir la comunicación por chat entre matches" />
          <Bullet icon="gavel" text="Moderar contenido y gestionar reportes" />
          <Bullet icon="trending-up" text="Mejorar la aplicación y detectar uso fraudulento" />
          <Bullet icon="block" iconColor={colors.primary} text="No utilizamos tus datos para publicidad ni perfiles comerciales" />
        </Section>

        {/* LOPDP - Base legal */}
        <View style={styles.lopdpTag}>
          <MaterialIcons name="gavel" size={14} color={colors.primary} />
          <Text style={styles.lopdpTagText}>LOPDP Ecuador</Text>
        </View>
        <Section title="3. Base legal para el tratamiento">
          De conformidad con la <Text style={styles.bold}>Ley Orgánica de Protección de Datos Personales (LOPDP)</Text> de Ecuador, la base legal para el tratamiento de tus datos es:
        </Section>
        <Bullet icon="check-circle" text="Consentimiento explícito: al registrarte y marcar la casilla de aceptación nos otorgas tu consentimiento libre, informado e inequívoco" />
        <Bullet icon="check-circle" text="Ejecución de un contrato: necesario para prestar los servicios de la plataforma" />
        <Bullet icon="check-circle" text="Interés legítimo: para moderar contenido, prevenir fraudes y mejorar la seguridad" />
        <Text style={[styles.body, { marginTop: spacing.md }]}>
          Puedes revocar tu consentimiento en cualquier momento eliminando tu cuenta. La revocación no afecta la licitud del tratamiento previo.
        </Text>

        <Section title="4. Compartición de datos">
          <Text style={styles.body}>
            <Text style={styles.bold}>Con otros usuarios:</Text> tu nombre, fotos del perro, descripción, propósito y distancia son visibles para otros usuarios.
          </Text>
          <Text style={[styles.body, { marginTop: spacing.md }]}>
            <Text style={styles.bold}>Con terceros:</Text>
          </Text>
          <Bullet icon="storage" text="Supabase — base de datos y fotos (AWS São Paulo, Brasil)" />
          <Bullet icon="phone-android" text="Expo — desarrollo y notificaciones" />
          <Bullet icon="block" iconColor={colors.error} text="No vendemos ni compartimos datos con anunciantes" />
        </Section>

        {/* LOPDP - Transferencia */}
        <View style={styles.lopdpTag}>
          <MaterialIcons name="public" size={14} color={colors.primary} />
          <Text style={styles.lopdpTagText}>Transferencia internacional</Text>
        </View>
        <Section title="5. Transferencia internacional de datos">
          Los datos recogidos en Ecuador se almacenan en servidores en Brasil (AWS São Paulo). Esta transferencia se ampara en tu consentimiento explícito y en la necesidad de prestar el servicio. Supabase cumple con SOC 2 e ISO 27001.
        </Section>

        <Section title="6. Almacenamiento y seguridad">
          Tus datos se almacenan en Supabase (PostgreSQL) con cifrado en tránsito (TLS 1.3) y en reposo (AES-256). Las contraseñas se cifran con bcrypt. Solo personal autorizado tiene acceso.
        </Section>

        <Section title="7. Retención de datos">
          Conservamos tus datos mientras tengas una cuenta activa. Al eliminar tu cuenta, los datos se borran en 30 días. Registros de reportes anonimizados pueden conservarse hasta 90 días por seguridad.
        </Section>

        {/* LOPDP - Derechos ARCO */}
        <View style={styles.lopdpTag}>
          <MaterialIcons name="verified-user" size={14} color={colors.primary} />
          <Text style={styles.lopdpTagText}>Tus derechos (LOPDP)</Text>
        </View>
        <Section title="8. Tus derechos">
          De conformidad con la LOPDP, tienes los siguientes derechos:
        </Section>
        <Bullet icon="remove-red-eye" text="Acceso: ve tus datos en el perfil" />
        <Bullet icon="edit" text="Corrección: edita tu perfil cuando quieras" />
        <Bullet icon="delete" text="Eliminación: elimina tu cuenta desde la app" />
        <Bullet icon="block" text="Oposición: oponte al tratamiento contactándonos" />
        <Bullet icon="download" text="Portabilidad: solicita copia de tus datos por email" />
        <Bullet icon="undo" text="Revocación: revoca tu consentimiento eliminando tu cuenta" />
        <Text style={[styles.body, { marginTop: spacing.md, fontStyle: 'italic' }]}>
          Ejercer tus derechos es gratuito. Respondemos en máximo 15 días hábiles.
        </Text>

        <Section title="9. Menores de edad">
          TinderCanino es para mayores de 18 años. No recopilamos datos de menores. Si descubrimos una cuenta de un menor, la eliminamos inmediatamente.
        </Section>

        <Section title="10. Cambios a esta política">
          Notificaremos cambios significativos por la app o email. El uso continuado después de los cambios constituye aceptación.
        </Section>

        <Section title="11. Contacto">
          Para preguntas, ejercer tus derechos o presentar una queja:
        </Section>
        <View style={styles.contactCard}>
          <MaterialIcons name="email" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactEmail}>privacidad@tindercanino.app</Text>
            <Text style={styles.contactSub}>Respuesta en máximo 15 días hábiles</Text>
          </View>
        </View>
        <Text style={[styles.body, { textAlign: 'center' }]}>
          También puedes presentar una reclamación ante la{' '}
          <Text style={styles.bold}>Autoridad de Protección de Datos Personales del Ecuador</Text>.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Esta política cumple con la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador.
          </Text>
          <Text style={styles.revision}>Última revisión: 14 de junio de 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children && <Text style={styles.body}>{children}</Text>}
    </View>
  );
}

function Bullet({ icon, text, iconColor }) {
  return (
    <View style={styles.bulletRow}>
      <MaterialIcons
        name={icon}
        size={16}
        color={iconColor || colors.accent}
        style={styles.bulletIcon}
      />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
    paddingTop: 50, paddingBottom: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border, ...shadows.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.borderLight,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  headerText: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.xxl, paddingBottom: 60 },
  fecha: {
    fontSize: 12, color: colors.textLight, fontStyle: 'italic',
    marginBottom: spacing.xxl, textAlign: 'center',
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  body: { fontSize: 14, color: colors.text, lineHeight: 22 },
  bold: { fontWeight: '700', color: colors.accentDark },
  bulletRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: spacing.sm, paddingLeft: spacing.sm,
  },
  bulletIcon: { marginTop: 3, marginRight: spacing.md },
  bulletText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  lopdpTag: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#FFF0E8', borderRadius: 12, paddingHorizontal: 10,
    paddingVertical: 3, gap: 4, marginBottom: spacing.xs,
  },
  lopdpTagText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, gap: spacing.md, marginBottom: spacing.xxl, ...shadows.sm,
  },
  contactEmail: { fontSize: 14, fontWeight: '600', color: colors.primary },
  contactSub: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  footer: {
    marginTop: spacing.xl, paddingTop: spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 11, color: colors.textLight, fontStyle: 'italic',
    textAlign: 'center', lineHeight: 16,
  },
  revision: {
    fontSize: 11, color: colors.textLight, textAlign: 'center',
    marginTop: spacing.sm, fontStyle: 'italic',
  },
});
