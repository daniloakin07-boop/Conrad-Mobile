import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/AuthContext";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, Title } from "../src/ui/page";

export default function Mais() {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const isEducador = usuario.tipo === "educador";

  const itens = [
    ["person-outline", "Meu perfil", "/perfil"],
    isEducador
      ? ["calendar-outline", "Agenda", "/agenda"]
      : ["time-outline", "Horário das aulas", "/horario"],
    !isEducador && ["ribbon-outline", "Boletim", "/boletim"],
    ["videocam-outline", "Salas de vídeo", "/salas"],
    ["information-circle-outline", "Sobre a Conrad", "/sobre"],
    ["mail-outline", "Fale conosco", "/contato"],
  ].filter(Boolean);

  async function sair() {
    await logout();
    router.replace("/login");
  }

  return (
    <Page>
      <Title sub={usuario.nome}>{isEducador ? "Conrad Educador" : "Conrad Aluno"}</Title>
      <Card style={{ paddingVertical: 4 }}>
        {itens.map(([icon, label, rota], i) => (
          <Pressable key={rota} style={[styles.row, i > 0 && styles.border]} onPress={() => router.push(rota)}>
            <Ionicons name={icon} size={20} color={COLORS.navy} />
            <Text style={styles.label}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9aa1ab" />
          </Pressable>
        ))}
        <Pressable style={[styles.row, styles.border]} onPress={sair}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={[styles.label, { color: COLORS.error }]}>Sair</Text>
        </Pressable>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  border: { borderTopWidth: 1, borderTopColor: "#eef1f4" },
  label: { flex: 1, fontFamily: FONTS.bodySemiBold, fontSize: 15, color: COLORS.navy },
});