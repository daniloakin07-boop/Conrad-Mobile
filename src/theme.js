// Design tokens do CONRAD Web (CSS/geral.css, usuarios.css, atividades.css).
// Valores conferidos contra os hex mais usados nesses arquivos:
// #0a1f44 (azul-escuro), #f5821f (laranja), #163b74 (brand-dark),
// #e3e7eb / #d8dce1 (bordas), #667085 (texto secundário), #287a45 (sucesso),
// #c0392b (erro). O modo escuro do Web (tema.js) ainda não foi portado.

export const COLORS = {
  navy: "#0A1F44",
  navyDark: "#071333", // bottom of the hero gradient
  navyLight: "#163a6e", // .btn-primario:hover
  orange: "#F5821F",
  orangeDark: "#db770f", // hover state
  background: "#f5f6fa", // --fundo do Web
  backgroundAlt: "#f2f5f9", // .recursos-simples
  card: "#ffffff",
  border: "#e3e7eb",
  borderInput: "#d8dce1",
  text: "#0A1F44",
  textMuted: "#667085", // --texto-secundario
  textMuted2: "#6b7280",
  success: "#287a45",
  successBg: "#e8f6ed",
  successText: "#1d6b43",
  warnBg: "#fdf0cf",
  warnText: "#8a5a00",
  errorBg: "#fbe2df",
  chip: "#e6ecf5",
  hairline: "#eef1f4",
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