import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";
import { makeStyles } from "../ui/estilos";

export default function DashboardCard({ icon, title, emptyText, children }) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      {children ? children : <Text style={styles.empty}>{emptyText}</Text>}
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
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.text,
  },
  empty: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted2,
    lineHeight: 19,
  },
}));