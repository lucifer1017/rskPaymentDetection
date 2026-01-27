/**
 * Rootstock Color Scheme
 * Extracted from Hacktivator Marketplace design system
 */

export const rootstockColors = {
  orange: {
    DEFAULT: "#FF6B35", // Primary brand color (rsk-orange)
    light: "#FF8C5A",
    dark: "#E55A2B",
  },
  green: {
    DEFAULT: "#4CAF50", // Code/Tool badges (rsk-green)
    light: "#66BB6A",
    dark: "#388E3C",
  },
  lime: {
    DEFAULT: "#CDDC39", // Video Tutorial badges (rsk-lime)
    light: "#D4E157",
    dark: "#AFB42B",
  },
  pink: {
    DEFAULT: "#E91E63", // Written Tutorial badges (rsk-pink)
    light: "#EC407A",
    dark: "#C2185B",
  },
  purple: {
    DEFAULT: "#9C27B0", // Documentation badges (rsk-purple)
    light: "#AB47BC",
    dark: "#7B1FA2",
  },

  simpleButton: "#1A1A1A",
  secondary: "#0F0F0F",
  border: "#333333",
  foreground: "#FFFFFF",
  
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
} as const;

export const rootstockTheme = {
  colors: {
    "rsk-orange": rootstockColors.orange.DEFAULT,
    "rsk-green": rootstockColors.green.DEFAULT,
    "rsk-lime": rootstockColors.lime.DEFAULT,
    "rsk-pink": rootstockColors.pink.DEFAULT,
    "rsk-purple": rootstockColors.purple.DEFAULT,
    "simple-button": rootstockColors.simpleButton,
    secondary: rootstockColors.secondary,
    border: rootstockColors.border,
    foreground: rootstockColors.foreground,
  },
} as const;
