// TermsScreen — Términos de Servicio (actualizado 14-jun)
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, radius, shadows } from '../styles/theme';

export default function TermsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerIcon}>🐾</Text>
          <Text style={styles.headerTitle}>Términos de Servicio</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.fecha}>Última actualización: 14 de junio de 2026</Text>

        <Section title="1. Aceptación de términos">
          Al crear una cuenta y usar TinderCanino, aceptas estos términos en su totalidad.
          Si no estás de acuerdo, no uses la aplicación. TinderCanino es una plataforma social
          para conectar dueños de perros. Estos términos constituyen un acuerdo legal entre
          tú y TinderCanino.
        </Section>

        <Section title="2. Requisitos">
          <Bullet icon="check-circle" text="Tener al menos 18 años" />
          <Bullet icon="check-circle" text="Ser dueño o responsable de un perro" />
          <Bullet icon="check-circle" text="Proporcionar información veraz y actualizada" />
          <Bullet icon="check-circle" text="No tener cuentas múltiples (una persona = una cuenta)" />
          <Bullet icon="check-circle" text="No usar la plataforma con fines comerciales sin autorización" />
        </Section>

        <Section title="3. Registro y seguridad">
          <Bullet icon="lock" text="Eres responsable de mantener tu contraseña segura" />
          <Bullet icon="notifications" text="Notifícanos inmediatamente si sospechas de uso no autorizado" />
          <Bullet icon="block" text="No compartas tu cuenta con terceros" />
          <Bullet icon="verified-user" text="Podemos verificar la identidad de los usuarios" />
        </Section>

        <Section title="4. Conducta del usuario">
          <Text style={[styles.body, styles.redLabel]}>No está permitido:</Text>
          <Bullet icon="block" iconColor={colors.error} text="Contenido falso, engañoso o malintencionado" />
          <Bullet icon="block" iconColor={colors.error} text="Acoso, discriminación o lenguaje ofensivo" />
          <Bullet icon="block" iconColor={colors.error} text="Suplantación de identidad (personas o mascotas)" />
          <Bullet icon="block" iconColor={colors.error} text="Uso comercial no autorizado" />
          <Bullet icon="block" iconColor={colors.error} text="Intentar vulnerar la seguridad o hacer scraping" />
          <Bullet icon="block" iconColor={colors.error} text="Fotos que no sean de tu perro o contenido inapropiado" />
          <Bullet icon="block" iconColor={colors.error} text="Spam o solicitudes de pago a otros usuarios" />
        </Section>

        <Section title="5. Reportes y moderación">
          Los usuarios pueden reportar contenido inapropiado. Nos reservamos el derecho de:
          <Bullet icon="gavel" text="Suspender o eliminar cuentas que violen estos términos" />
          <Bullet icon="delete" text="Eliminar contenido inapropiado" />
          <Bullet icon="block" text="Bloquear usuarios de forma temporal o permanente" />
          <Text style={[styles.body, { marginTop: spacing.sm, fontStyle: 'italic' }]}>
            Las decisiones de moderación son definitivas para cuentas gratuitas.
          </Text>
        </Section>

        <Section title="6. Privacidad">
          El tratamiento de tus datos personales se rige por nuestra Política de Privacidad,
          la cual cumple con la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador.
          Al usar TinderCanino, consientes el tratamiento de tus datos según lo descrito en dicha política.
        </Section>

        <Section title="7. Propiedad intelectual">
          TinderCanino, su nombre, logotipo y diseño son propiedad de sus creadores.
          El contenido que subes (fotos, descripciones) sigue siendo tuyo, pero nos otorgas
          una licencia no exclusiva, gratuita y mundial para mostrarlo dentro de la aplicación
          con el único propósito de operar la plataforma.
        </Section>

        <Section title="8. Limitación de responsabilidad">
          TinderCanino es un conector social — no somos responsables de:
          <Bullet icon="people" text="Interacciones entre usuarios fuera de la plataforma" />
          <Bullet icon="warning" text="El comportamiento de usuarios durante encuentros presenciales" />
          <Bullet icon="error" text="Daños derivados del uso de la aplicación" />
          <Bullet icon="fact-check" text="La veracidad de información publicada por otros usuarios" />
          <Text style={[styles.body, { marginTop: spacing.sm }]}>
            Recomendamos siempre realizar los primeros encuentros en lugares públicos y con compañía.
          </Text>
        </Section>

        <Section title="9. Terminación">
          <Bullet icon="person" text="Por tu parte: elimina tu cuenta desde Perfil → Configuración" />
          <Bullet icon="gavel" text="Por nuestra parte: podemos suspender tu cuenta si violas estos términos" />
          <Bullet icon="delete" text="Al eliminar tu cuenta, tu perfil deja de ser visible de inmediato. Datos eliminados en 30 días" />
        </Section>

        <Section title="10. Ley aplicable">
          Estos términos se rigen por las leyes de la República del Ecuador. Cualquier
          disputa será sometida a la jurisdicción de los tribunales de Ecuador.
        </Section>

        <Section title="11. Cambios a los términos">
          Podemos actualizar estos términos. Te notificaremos de cambios significativos.
          El uso continuado después de 15 días de publicados los cambios constituye aceptación.
        </Section>

        <Section title="12. Contacto">
          Para preguntas sobre estos términos:
        </Section>
        <View style={styles.contactCard}>
          <MaterialIcons name="email" size={18} color={colors.primary} />
          <Text style={styles.contactEmail}>soporte@tindercanino.app</Text>
        </View>

        <View style={styles.footer}>
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
  redLabel: { fontWeight: '600', color: colors.error, marginBottom: spacing.sm },
  bulletRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: spacing.sm, paddingLeft: spacing.sm,
  },
  bulletIcon: { marginTop: 3, marginRight: spacing.md },
  bulletText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, gap: spacing.md, marginBottom: spacing.xxl, ...shadows.sm,
  },
  contactEmail: { fontSize: 14, fontWeight: '600', color: colors.primary },
  footer: {
    marginTop: spacing.xl, paddingTop: spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  revision: {
    fontSize: 11, color: colors.textLight, textAlign: 'center',
    marginTop: spacing.sm, fontStyle: 'italic',
  },
});
