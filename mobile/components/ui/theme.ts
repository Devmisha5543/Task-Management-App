// Gluestack UI inspired theme tokens for clean, modern mobile aesthetics
export const theme = {
  colors: {
    // Primary / Neutral palette
    primary50: "#EEF2FF",
    primary100: "#E0E7FF",
    primary500: "#4F46E5",
    primary600: "#4338CA",
    primary700: "#3730A3",

    // Backgrounds & Surfaces
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",
    surfaceSubtle: "#F8FAFC",

    // Borders
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    borderFocused: "#4F46E5",

    // Text
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    textInverse: "#FFFFFF",

    // Status Colors
    successLight: "#ECFDF5",
    successBorder: "#A7F3D0",
    success: "#059669",

    warningLight: "#FFFBEB",
    warningBorder: "#FDE68A",
    warning: "#D97706",

    dangerLight: "#FEF2F2",
    dangerBorder: "#FECACA",
    danger: "#DC2626",

    infoLight: "#EFF6FF",
    infoBorder: "#BFDBFE",
    info: "#2563EB",

    purpleLight: "#FAF5FF",
    purpleBorder: "#E9D5FF",
    purple: "#7C3AED",
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
  },
};
