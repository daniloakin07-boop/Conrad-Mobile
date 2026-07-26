// Design tokens ported 1:1 from CSS/auth.css and CSS/style.css so the app
// matches the web version's brand exactly. If the full ten-page design
// system (green/cream tones mentioned alongside navy/orange) uses colors
// beyond what's below, add them here — this file only has what's actually
// present in the CSS that shipped with this upload.

export const COLORS = {
  navy: "#0A1F44",
  navyDark: "#071333", // bottom of the hero gradient
  navyLight: "#163a6e", // .btn-primario:hover
  orange: "#F5821F",
  orangeDark: "#db770f", // hover state
  background: "#f5f6f8",
  backgroundAlt: "#f2f5f9", // .recursos-simples
  card: "#ffffff",
  border: "#e3e7eb",
  borderInput: "#d8dce1",
  text: "#0A1F44",
  textMuted: "#666666",
  textMuted2: "#6b7280",
  success: "#2E8B57",
  error: "#c0392b",
  white: "#ffffff",
  iconBg: "rgba(37, 99, 235, 0.1)",
  iconColor: "#2563EB",
};

// Loaded via @expo-google-fonts in app/_layout.js — same two families as
// the web (Bebas Neue for display/headings, Nunito for body/forms).
export const FONTS = {
  display: "BebasNeue_400Regular",
  body: "Nunito_400Regular",
  bodySemiBold: "Nunito_600SemiBold",
  bodyBold: "Nunito_700Bold",
  bodyExtraBold: "Nunito_800ExtraBold",
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 14,
  pill: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
};
