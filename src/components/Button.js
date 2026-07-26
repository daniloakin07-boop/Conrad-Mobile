import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";

// Mirrors three button treatments from the web CSS:
// - solid:   .btn-primario in auth.css      (navy block button, forms)
// - cta:     .btn-primario in style.css     (orange pill, hero/topo CTA)
// - outline: .btn-link in style.css         (translucent pill, hero secondary CTA)
const VARIANTS = {
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
  outline: {
    bg: "rgba(255,255,255,0.16)",
    bgPressed: "rgba(255,255,255,0.26)",
    color: COLORS.white,
    radius: RADIUS.pill,
    block: false,
    borderColor: "rgba(255,255,255,0.75)",
  },
};

export default function Button({
  label,
  onPress,
  variant = "solid",
  loading = false,
  disabled = false,
  style,
}) {
  const v = VARIANTS[variant];
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

const styles = StyleSheet.create({
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
});
