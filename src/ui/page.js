import { useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../theme";

// Container padrão das telas: scroll, pull-to-refresh, loading e erro.
export default function Page({ children, loading, error, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.navy} /> : undefined
      }
    >
      {loading ? (
        <ActivityIndicator color={COLORS.navy} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        children
      )}
    </ScrollView>
  );
}

export function Title({ children, sub }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.title}>{children}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Empty({ text }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export function Badge({ label, color = COLORS.navy, bg = "#e6ecf5" }) {
  return (
    <Text style={[styles.badge, { color, backgroundColor: bg }]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 32 },
  title: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.navy, letterSpacing: 0.5 },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 12,
  },
  empty: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted2, lineHeight: 19 },
  error: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.error, textAlign: "center", marginTop: 30 },
  badge: {
    alignSelf: "flex-start",
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    overflow: "hidden",
  },
});