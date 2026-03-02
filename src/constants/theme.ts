// SÁLVAME — Design System
// Dark mode by default, Material Design 3 inspired
// Primary action color: Red (#E8281A) — communicates urgency

export const Colors = {
  // Primary
  primary: '#E8281A',
  primaryDark: '#B71C1C',
  primaryLight: '#FF5252',
  primaryContainer: '#3D0000',

  // Background (Dark mode default)
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceVariant: '#2A2A2A',
  surfaceElevated: '#242424',

  // Text
  onBackground: '#FFFFFF',
  onSurface: '#F5F5F5',
  onSurfaceVariant: '#BDBDBD',
  onSurfaceDisabled: '#616161',

  // Semantic
  success: '#4CAF50',
  successContainer: '#1B5E20',
  warning: '#FF9800',
  warningContainer: '#E65100',
  error: '#E8281A',
  errorContainer: '#3D0000',
  info: '#2196F3',

  // Borders
  outline: '#3A3A3A',
  outlineVariant: '#2A2A2A',

  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // SOS Button specific
  sosButton: '#E8281A',
  sosButtonPressed: '#B71C1C',
  sosButtonGlow: 'rgba(232, 40, 26, 0.4)',
  sosButtonShadow: 'rgba(232, 40, 26, 0.6)',

  // Countdown
  countdownRing: '#E8281A',
  countdownBackground: 'rgba(232, 40, 26, 0.1)',
};

export const Typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
  '4xl': 48,
  '5xl': 60,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,

  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  sos: {
    shadowColor: Colors.sosButtonShadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
  },
};
