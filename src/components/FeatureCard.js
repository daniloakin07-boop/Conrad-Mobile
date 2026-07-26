import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";

// Mirrors .card-simples from the recursos-simples grid on the home page
export default function FeatureCard({ icon, title, description }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 16,
    width: "47%",
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
  title: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.navy,
    marginBottom: 4,
  },
  desc: {
    fontFamily: FONTS.body,
    fontSize: 12.5,
    color: COLORS.textMuted2,
    lineHeight: 18,
  },
});
