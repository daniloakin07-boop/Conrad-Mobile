// ============================================================================
// src/components/AssistenteCard.js — atalho para o Assistente de IA
// ============================================================================
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";

export default function AssistenteCard() {
  const s = useS();
  const router = useRouter();
  return (
    <Pressable style={s.card} onPress={() => router.push("/assistente")}>
      <Ionicons name="sparkles" size={24} color={COLORS.orange} />
      <View style={{ flex: 1 }}>
        <Text style={s.titulo}>Assistente de IA</Text>
        <Text style={s.sub}>Pergunte sobre atividades, aulas e notas</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
    </Pressable>
  );
}

const useS = makeStyles(() => ({
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.navy, borderRadius: 16, padding: 14, marginBottom: 12 },
  titulo: { fontFamily: FONTS.bodyBold, fontSize: 15, color: COLORS.white },
  sub: { fontFamily: FONTS.body, fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 1 },
}));
