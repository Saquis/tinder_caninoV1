// 🐾 TinderCanino Design System
// Colores, tipografía, sombras y estilos compartidos

export const colors = {
  // Fondos
  bg: '#FFF8F0',
  bgCard: '#FFFFFF',
  bgInput: '#FFF8F0',

  // Primario
  primary: '#C4622D',
  primaryLight: '#DF8A5A',
  primaryDark: '#A34D1F',

  // Secundario / Acentos
  accent: '#C4A882',
  accentDark: '#A07850',

  // Texto
  text: '#3D2B1A',
  textLight: '#A07850',
  textMuted: '#C4A882',
  textWhite: '#FFFFFF',

  // Bordes
  border: '#E0CAB4',
  borderLight: '#F0E0D0',

  // Estados
  success: '#4CAF50',
  error: '#E53935',
  warning: '#FF9800',
  info: '#5AC8FA',

  // Gradientes (para LinearGradient)
  gradientStart: '#FFF8F0',
  gradientMid: '#F5E8D8',
  gradientEnd: '#FFF8F0',

  // Oscuros (para overlay)
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.3)',

  // Botones acción swipe
  like: '#4CAF50',
  nope: '#E53935',
  superLike: '#5AC8FA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#3D2B1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#3D2B1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#3D2B1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const typography = {
  h1: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    color: colors.textLight,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentDark,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

export const cardStyle = {
  backgroundColor: colors.bgCard,
  borderRadius: radius.xl,
  borderWidth: 0.5,
  borderColor: colors.border,
  ...shadows.md,
};

export const inputStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.bgInput,
  borderRadius: radius.md,
  borderWidth: 1.5,
  borderColor: colors.border,
  paddingLeft: 14,
};

export const buttonPrimary = {
  backgroundColor: colors.primary,
  height: 50,
  borderRadius: radius.lg,
  alignItems: 'center',
  justifyContent: 'center',
};
