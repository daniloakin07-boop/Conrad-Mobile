// Design tokens do CONRAD Web (CSS/geral.css, usuarios.css, atividades.css).
// Valores conferidos contra os hex mais usados nesses arquivos:
// #0a1f44 (azul-escuro), #f5821f (laranja), #163b74 (brand-dark),
// #e3e7eb / #d8dce1 (bordas), #667085 (texto secundário), #287a45 (sucesso),
// #c0392b (erro).
//
// Temas (porte de JS/tema.js + :root[data-tema] de CSS/geral.css): normal, claro e
// escuro. COLORS é um objeto MUTÁVEL: aplicarPaleta() troca os valores e o
// ThemeContext re-renderiza as telas (os estilos são refeitos por makeStyles).

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
  // tokens de tema (variam em claro/escuro)
  headerBg: "#0A1F44",
  headerText: "#ffffff",
  headerBorder: "rgba(255,255,255,0.12)",
  heroFrom: "#0A1F44",
  heroTo: "#071333",
  heroText: "#ffffff",
  heroSub: "rgba(255,255,255,0.9)",
  tabBar: "#ffffff",
  tabInactive: "#8a94a6",
  placeholder: "#9aa1ab",
  overlay: "rgba(255,255,255,0.08)",
};

// Os três estados de JS/tema.js. "normal" é a aparência original (cabeçalho azul,
// fundo claro); "claro" usa o cabeçalho branco e o hero azul-claro do Web;
// "escuro" usa --fundo/--painel/--card/--texto/--borda do Web.
export const TEMAS = ["normal", "claro", "escuro"];
export const TEMA_INFO = {
  normal: { rotulo: "Normal", icone: "contrast-outline", proximo: "claro", acao: "Ativar tema claro" },
  claro: { rotulo: "Claro", icone: "sunny-outline", proximo: "escuro", acao: "Ativar tema escuro" },
  escuro: { rotulo: "Escuro", icone: "moon-outline", proximo: "normal", acao: "Ativar tema normal" },
};

const BASE = { ...COLORS };

export const PALETAS = {
  normal: { ...BASE },
  claro: {
    ...BASE,
    background: "#f5f6fa",
    backgroundAlt: "#f5f6fa",
    border: "#dce2eb",
    borderInput: "#cbd5e1",
    headerBg: "#ffffff",
    headerText: "#0A1F44",
    headerBorder: "#dce2eb",
    heroFrom: "#eaf1fb",
    heroTo: "#dce7f6",
    heroText: "#0A1F44",
    heroSub: "#344054",
    overlay: "rgba(10,31,68,0.06)",
  },
  escuro: {
    ...BASE,
    navy: "#1d4a8f", // preenchimentos (botões, abas) — o texto usa COLORS.text
    navyLight: "#2a5fae",
    background: "#121827", // --fundo
    backgroundAlt: "#1e293b", // --painel
    card: "#243247", // --card
    border: "#374151", // --borda
    borderInput: "#475569",
    text: "#f1f5f9", // --texto
    textMuted: "#cbd5e1", // --texto-secundario
    textMuted2: "#94a3b8",
    chip: "#334155",
    hairline: "#2f3d52",
    successBg: "#12372a",
    successText: "#86efac",
    warnBg: "#4a3b12",
    warnText: "#fcd34d",
    errorBg: "#4a1d1a",
    error: "#f0705f",
    iconBg: "rgba(147, 197, 253, 0.14)",
    iconColor: "#93c5fd",
    headerBg: "#0A1F44", // no Web o .topo continua azul no tema escuro
    headerText: "#ffffff",
    headerBorder: "rgba(255,255,255,0.12)",
    tabBar: "#1e293b",
    tabInactive: "#94a3b8",
    placeholder: "#94a3b8",
    overlay: "rgba(255,255,255,0.08)",
  },
};

// Troca os valores de COLORS no próprio objeto (as telas leem COLORS ao renderizar).
export function aplicarPaleta(nome) {
  const paleta = PALETAS[nome] || PALETAS.normal;
  Object.assign(COLORS, paleta);
  return paleta;
}

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