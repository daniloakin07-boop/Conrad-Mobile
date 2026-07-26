import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/AuthContext";
import DashboardCard from "../src/components/DashboardCard";
import HeaderLogoutButton from "../src/components/HeaderLogoutButton";
import { COLORS, FONTS } from "../src/theme";

export default function Aluno() {
  const { usuario, checking } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (checking) return;
    if (!usuario) {
      router.replace("/login");
    } else if (usuario.tipo !== "aluno") {
      router.replace("/educador");
    }
  }, [checking, usuario]);

  if (checking || !usuario || usuario.tipo !== "aluno") {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.navy} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <HeaderLogoutButton /> }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Olá, {usuario.nome.split(" ")[0]} 👋</Text>
        <Text style={styles.subtitle}>Bem-vindo(a) de volta à sua área do aluno.</Text>

        <DashboardCard
          icon={<Ionicons name="book-outline" size={20} color={COLORS.navy} />}
          title="Minhas atividades"
          emptyText="Nenhuma atividade publicada ainda. Quando um educador postar uma, ela aparece aqui."
        />
        <DashboardCard
          icon={<Ionicons name="people-outline" size={20} color={COLORS.navy} />}
          title="Minhas turmas"
          emptyText="Você ainda não está em nenhuma turma."
        />
        <DashboardCard
          icon={<Ionicons name="trending-up-outline" size={20} color={COLORS.navy} />}
          title="Progresso"
          emptyText="Seu progresso aparece aqui assim que houver atividades avaliadas."
        />

        <Text style={styles.note}>
          Versão mínima da área do aluno — o back-end (server.js) ainda não tem rotas para
          turmas/atividades, só auth e contato. Assim que existirem esses endpoints, dá pra
          plugar aqui direto.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  greeting: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.navy },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  note: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted2,
    lineHeight: 18,
    marginTop: 4,
    fontStyle: "italic",
  },
});
