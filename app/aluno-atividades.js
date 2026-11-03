import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../src/AuthContext";
import { COLORS, FONTS } from "../src/theme";

const navItems = ["Painel", "Atividades", "Salas"];

const fallbackTurmas = [
  { id: "turma-1", nome: "3° ano C" },
  { id: "turma-2", nome: "5° ano B" },
  { id: "turma-3", nome: "7° ano A" },
];

const fallbackAtividades = {
  "turma-1": { pendentes: 2, enviadas: 1, corrigidas: 3 },
  "turma-2": { pendentes: 1, enviadas: 2, corrigidas: 5 },
  "turma-3": { pendentes: 3, enviadas: 0, corrigidas: 2 },
};

export default function AlunoAtividades() {
  const router = useRouter();
  const { usuario, checking, logout } = useAuth();
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [showTurmaPicker, setShowTurmaPicker] = useState(false);

  const turmas = useMemo(() => {
    if (Array.isArray(usuario?.turmas) && usuario.turmas.length > 0) return usuario.turmas;
    if (Array.isArray(usuario?.turma) && usuario.turma.length > 0) return usuario.turma;
    return fallbackTurmas;
  }, [usuario]);

  useEffect(() => {
    if (checking) return;
    if (!usuario) {
      router.replace("/login");
      return;
    }
    if (usuario.tipo !== "aluno") {
      router.replace("/educador");
      return;
    }
    if (!turmaSelecionada && turmas.length > 0) {
      setTurmaSelecionada(String(turmas[0].id ?? turmas[0].nome));
    }
  }, [checking, usuario, router, turmas, turmaSelecionada]);

  const turmaAtual = useMemo(() => {
    const selected = turmas.find((item) => String(item.id ?? item.nome) === String(turmaSelecionada));
    return selected || turmas[0] || { id: "turma-1", nome: "Selecione..." };
  }, [turmas, turmaSelecionada]);

  const dadosAtividade = useMemo(() => {
    const chave = String(turmaAtual.id ?? turmaAtual.nome);
    return fallbackAtividades[chave] || { pendentes: 0, enviadas: 0, corrigidas: 0 };
  }, [turmaAtual]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  if (checking || !usuario || usuario.tipo !== "aluno") {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.navy} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.page}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>CONRAD</Text>

          <View style={styles.navWrap}>
            {navItems.map((item, index) => (
              <Text key={item} style={[styles.navItem, index === 1 && styles.navItemActive]}>
                {item}
              </Text>
            ))}
          </View>

          <Pressable style={styles.logoutWrap} onPress={handleLogout}>
            <Ionicons name="person-circle-outline" size={18} color={COLORS.white} />
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.centerPanel}>
            <Text style={styles.title}>MINHAS ATIVIDADES E PROVAS</Text>
            <Text style={styles.subtitle}>
              Envie suas respostas e acompanhe notas e feedback do professor.
            </Text>

            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>Minha turma:</Text>

              <Pressable style={styles.selectBox} onPress={() => setShowTurmaPicker(true)}>
                <Text style={styles.selectText}>{turmaAtual.nome}</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.navy} />
              </Pressable>

              <Pressable style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Salvar turma</Text>
              </Pressable>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dadosAtividade.pendentes}</Text>
                <Text style={styles.statLabel}>PENDENTES</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dadosAtividade.enviadas}</Text>
                <Text style={styles.statLabel}>ENVIADAS</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dadosAtividade.corrigidas}</Text>
                <Text style={styles.statLabel}>CORRIGIDAS</Text>
              </View>
            </View>

            <Text style={styles.errorText}>Não foi possível carregar: Failed to fetch</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Conrad Virtual School. Todos os direitos reservados.</Text>
        </View>

        <Modal transparent visible={showTurmaPicker} animationType="fade" onRequestClose={() => setShowTurmaPicker(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowTurmaPicker(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Selecionar turma</Text>
              {turmas.map((turma) => {
                const value = String(turma.id ?? turma.nome);
                const selected = value === String(turmaSelecionada);

                return (
                  <Pressable
                    key={value}
                    style={[styles.optionItem, selected && styles.optionItemSelected]}
                    onPress={() => {
                      setTurmaSelecionada(value);
                      setShowTurmaPicker(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {turma.nome}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable style={styles.cancelButton} onPress={() => setShowTurmaPicker(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  page: {
    flex: 1,
    backgroundColor: "#dfe5ea",
  },
  topBar: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 35,
    letterSpacing: 0.5,
  },
  navWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 18,
  },
  navItem: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    opacity: 0.9,
  },
  navItemActive: {
    color: COLORS.orange,
  },
  logoutWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  logoutText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 18,
    paddingBottom: 30,
  },
  centerPanel: {
    width: "100%",
    maxWidth: 840,
    alignItems: "center",
  },
  title: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 32,
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#5f6d80",
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 620,
    marginBottom: 22,
  },
  filterBox: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "#dfe5ea",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  filterLabel: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    minWidth: 110,
    textAlign: "right",
  },
  selectBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4f6f7",
    borderWidth: 1,
    borderColor: "#d9dee3",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
  },
  selectText: {
    color: "#778190",
    fontFamily: FONTS.body,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  statsGrid: {
    width: "100%",
    maxWidth: 600,
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "#dfe5ea",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 32,
    lineHeight: 34,
  },
  statLabel: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  errorText: {
    marginTop: 18,
    color: "#d4493f",
    fontFamily: FONTS.body,
    fontSize: 13,
    fontStyle: "italic",
  },
  footer: {
    backgroundColor: COLORS.navy,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 31, 68, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dfe5ea",
  },
  modalTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 20,
    marginBottom: 12,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f3f6f8",
  },
  optionItemSelected: {
    backgroundColor: "#eaf1ff",
    borderWidth: 1,
    borderColor: "#cfe0ff",
  },
  optionText: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 15,
  },
  optionTextSelected: {
    fontFamily: FONTS.bodyBold,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: COLORS.navy,
  },
  cancelText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
});
