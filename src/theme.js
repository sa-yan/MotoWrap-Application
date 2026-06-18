// src/theme.js - Design System & Colors

export const theme = {
  // Primary colors
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1e40af',
    
    // Status colors
    success: '#16a34a',
    successLight: '#22c55e',
    danger: '#dc2626',
    dangerLight: '#ef4444',
    warning: '#f59e0b',
    
    // Neutral colors
    white: '#ffffff',
    black: '#000000',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    
    // Semantic colors
    text: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    background: '#f9fafb',
    backgroundCard: '#ffffff',
    border: '#e5e7eb',
    divider: '#e5e7eb',
  },

  // Gradients
  gradients: {
    primary: ['#2563eb', '#3b82f6'],
    success: ['#16a34a', '#22c55e'],
    danger: ['#dc2626', '#ef4444'],
    accent: ['#2563eb', '#1e40af'],
  },

  // Typography
  typography: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyBold: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
    subtitle: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
    captionBold: { fontSize: 12, fontWeight: '600', lineHeight: 18 },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // Common style patterns
  patterns: {
    buttonBase: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    cardBase: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    inputBase: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
  },
};

export default theme;
