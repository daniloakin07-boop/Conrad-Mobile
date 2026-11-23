// ============================================================================
// src/components/FeatureCard.js — cartão de recurso da Home
// Props: icon (nome Ionicons), title e description. Usado em app/index.js (seção "Recursos").
// ============================================================================
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";
import { makeStyles } from "../ui/estilos";

// Espelha .card-simples da seção "Recursos" da página inicial do Web.
// `icon` é o nome de um ícone Ionicons (resolvido na renderização, para seguir o tema).
export default function FeatureCard({ icon, title, description }) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={COLORS.iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    width: "48%",
    marginBottom: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text, marginBottom: 4 },
  desc: { fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.textMuted2, lineHeight: 18 },
}));
