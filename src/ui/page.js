import { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../AuthContext";
import { ehEducador } from "../format";
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

  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, { paddingBottom: 32 + insets.bottom }]}
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

// Seletor em abas (ex.: Atividades | Avaliações).
export function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.seg}>
      {options.map(([k, label]) => (
        <Pressable key={String(k)} onPress={() => onChange(k)} style={[styles.segItem, value === k && styles.segOn]}>
          <Text style={[styles.segT, value === k && { color: COLORS.white }]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Chips de filtro (ex.: turmas).
export function Chips({ options, value, onChange }) {
  return (
    <View style={styles.chips}>
      {options.map(([k, label]) => (
        <Pressable key={String(k)} onPress={() => onChange(k)} style={[styles.chip, value === k && styles.segOn]}>
          <Text style={[styles.segT, value === k && { color: COLORS.white }]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Protege telas por perfil (o servidor também valida: isto só evita telas quebradas).
export function SoPara({ tipo, children }) {
  const { usuario } = useAuth();
  const ok = tipo === "educador" ? ehEducador(usuario) : !ehEducador(usuario);
  if (ok) return children;
  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: COLORS.background }}>
      <Text style={styles.error}>
        {tipo === "educador" ? "Esta área é exclusiva de educadores." : "Esta área é exclusiva de alunos."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: "row", gap: 8, marginBottom: 12 },
  segItem: { flex: 1, minHeight: 44, borderRadius: 10, backgroundColor: COLORS.chip, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  segOn: { backgroundColor: COLORS.navy },
  segT: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.navy },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: RADIUS.pill, backgroundColor: COLORS.chip, alignItems: "center", justifyContent: "center" },
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