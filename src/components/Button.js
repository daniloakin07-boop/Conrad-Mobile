// ============================================================================
// src/components/Button.js — botão padrão do app
// Props: label (texto), onPress, variant ("solid" | "cta" | "outline" | "danger"), loading (mostra
// spinner e bloqueia toques), disabled e style (ajustes pontuais do chamador).
// Usado em praticamente todas as telas (login, cadastro, turmas, atividades...).
// ============================================================================
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";
import { makeStyles } from "../ui/estilos";

// Variantes de botão, espelhando os botões do CSS do Web:
// - solid:   .btn-primario dos formulários (bloco azul-marinho, largura total);
// - cta:     .btn-primario do topo/hero (pílula laranja);
// - outline: .btn-link do hero (pílula branca com texto azul);
// - danger:  .btn-perigo (ação destrutiva, como "Excluir").
// As cores vêm de COLORS e acompanham o tema ativo (normal/claro/escuro).
const variantes = () => ({
  solid: {
    bg: COLORS.navy,
    bgPressed: COLORS.navyLight,
    color: COLORS.white,
    radius: RADIUS.md,
    block: true,
  },
  cta: {
    bg: COLORS.orange,
    bgPressed: COLORS.orangeDark,
    color: COLORS.white,
    radius: RADIUS.pill,
    block: false,
  },
  // danger: ação destrutiva (excluir) — equivale ao .btn-perigo do Web; usa a cor de erro do tema
  danger: {
    bg: COLORS.error,
    bgPressed: COLORS.error,
    color: COLORS.white,
    radius: RADIUS.md,
    block: true,
  },
  // .hero-simples .btn-link do Web: pílula branca com texto azul
  outline: {
    bg: "#ffffff",
    bgPressed: "#f4f6fb",
    color: "#0A1F44",
    radius: RADIUS.pill,
    block: false,
    borderColor: COLORS.borderInput,
  },
});

export default function Button({
  label,
  onPress,
  variant = "solid",
  loading = false,
  disabled = false,
  style,
}) {
  const styles = useStyles();
  const v = variantes()[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? v.bgPressed : v.bg,
          borderRadius: v.radius,
          alignSelf: v.block ? "stretch" : "center",
          borderWidth: v.borderColor ? 1 : 0,
          borderColor: v.borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.color} />
      ) : (
        <Text style={[styles.label, { color: v.color }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
  },
}));