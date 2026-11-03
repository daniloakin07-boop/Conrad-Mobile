import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/AuthContext";
import { COLORS, FONTS } from "../src/theme";

const navItems = ["inicio", "sobre", "contato"];

const horario = [
  { hora: "07:15", label: "Português", local: "Sala 13 • Prof. Claudiane", destaque: false },
  { hora: "08:00", label: "Filosofia", local: "Sala 12 • Prof. Carlos", destaque: false },
  { hora: "08:45", label: "Intervalo", local: "", destaque: true },
  { hora: "09:55", label: "Física", local: "Sala 6 • Prof. Margarete", destaque: false },
  { hora: "09:40", label: "Química", local: "Sala 1 • Prof. Diana", destaque: false },
  { hora: "10:25", label: "Intervalo", local: "", destaque: true },
  { hora: "10:50", label: "História", local: "Sala 1 • Prof. João", destaque: false },
  { hora: "11:35", label: "Matemática", local: "Sala 2 • Prof. Guilherme", destaque: false },
];

const avisos = [
  { tipo: "Aviso", titulo: "Prova de Química remarcada para sexta-feira, dia 25, no 1° horário.", tempo: "há 2 horas", estilo: "aviso" },
  { tipo: "Evento", titulo: "Feira de ciências quinta-feira.", tempo: "há 30 minutos", estilo: "evento" },
  { tipo: "Comunicado", titulo: "Reunião de pais e mestres marcada para o dia 30, às 19h no auditório.", tempo: "há 6 horas", estilo: "comunicado" },
];

const tarefas = [
  { titulo: "Lista de exercícios — Equações do 2º grau", disciplina: "Matemática • Entrega hoje, 23:59", checked: false },
  { titulo: "Resumo do capítulo 4", disciplina: "História • Entrega amanhã", checked: false },
  { titulo: "Redação — tema livre", disciplina: "Português • Entrega quarta-feira", checked: false },
];

export default function Dashboard() {
  const router = useRouter();
  const { usuario, checking } = useAuth();

  useEffect(() => {
    if (checking) return;
    if (!usuario) {
      router.replace("/login");
    } else if (usuario.tipo !== "aluno") {
      router.replace("/educador");
    }
  }, [checking, usuario, router]);

  const nome = useMemo(() => usuario?.nome || "Rickson Jordan", [usuario]);

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
            {navItems.map((item) => (
              <Text key={item} style={styles.navItem}>{item}</Text>
            ))}
          </View>

          <Pressable style={styles.userButton}>
            <Ionicons name="person-circle-outline" size={18} color={COLORS.white} />
            <Text style={styles.userButtonText}>Minha conta</Text>
          </Pressable>

          <Pressable style={styles.logoutButton} onPress={() => router.replace("/login")}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <View style={styles.layout}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarCardTitle}>
              <Text style={styles.sidebarTitle}>CONRAD ALUNO</Text>
            </View>

            <View style={styles.sideMenu}>
              <Text style={styles.sideItem}>Painel</Text>
              <Text style={styles.sideItem}>Calendário</Text>
              <Text style={styles.sideItem}>Frequência das aulas</Text>
              <Text style={styles.sideItem}>Desempenho do aluno</Text>
              <Text style={[styles.sideItem, styles.sideItemActive]}>Horário das aulas</Text>
              <Text style={styles.sideItem}>Atividades</Text>
              <Text style={styles.sideItem}>Bate-Papo</Text>
              <Text style={styles.sideItem}>Salas virtuais</Text>
              <Text style={styles.sideItem}>Meu perfil</Text>
            </View>

            <View style={styles.sideActionGroup}>
              <Pressable style={styles.sideAction}>
                <Text style={styles.sideActionText}>Precisa de ajuda?</Text>
                <Text style={styles.sideActionSub}>Acesse o suporte da plataforma.</Text>
              </Pressable>
              <Pressable style={styles.sideSupport}>
                <Text style={styles.sideSupportText}>Suporte</Text>
              </Pressable>
            </View>

            <View style={styles.profileCard}>
              <Text style={styles.profileText}>Minha conta</Text>
              <Text style={styles.profileSub}>Aluno</Text>
            </View>
          </View>

          <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
            <View style={styles.greetingCard}>
              <Text style={styles.greetingTitle}>BOA TARDE, {nome.toUpperCase()}</Text>
              <Text style={styles.greetingSubtitle}>Confira seus horários e avisos de hoje.</Text>
            </View>

            <View style={styles.contentGrid}>
              <View style={styles.scheduleCard}>
                <Text style={styles.cardTitle}>HORÁRIO</Text>

                <View style={styles.tableHeader}>
                  {["Seg", "Ter", "Qua", "Qui", "Sex"].map((dia) => (
                    <Text key={dia} style={styles.dayHeader}>{dia}</Text>
                  ))}
                </View>

                <View style={styles.tableRows}>
                  {horario.map((item) => (
                    <View key={`${item.hora}-${item.label}`} style={[styles.row, item.destaque && styles.rowHighlight]}>
                      <Text style={styles.time}>{item.hora}</Text>
                      <View style={styles.subjectWrap}>
                        <Text style={[styles.subject, item.destaque && styles.subjectHighlight]}>{item.label}</Text>
                        {item.local ? <Text style={styles.local}>{item.local}</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sidebarCards}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Mural de Avisos</Text>
                  {avisos.map((aviso) => (
                    <View key={aviso.titulo} style={styles.noticeRow}>
                      <Text style={[styles.noticeBadge, aviso.estilo === "evento" && styles.badgeEvent, aviso.estilo === "comunicado" && styles.badgeComunicado]}>{aviso.tipo}</Text>
                      <Text style={styles.noticeText}>{aviso.titulo}</Text>
                      <Text style={styles.noticeTime}>{aviso.tempo}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.frequencyCard}>
                  <Text style={styles.frequencyTitle}>Frequência</Text>
                  <View style={styles.frequencyContent}>
                    <View style={styles.donutWrap}>
                      <View style={styles.donut}>
                        <Text style={styles.donutValue}>92%</Text>
                      </View>
                    </View>
                    <View style={styles.frequencyTextWrap}>
                      <Text style={styles.frequencyValue}>3 faltas este bimestre</Text>
                      <Text style={styles.frequencyMeta}>Limite permitido: 15%</Text>
                      <Text style={styles.frequencyMeta}>Vozes do limite: 10%</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tasksCard}>
                  <Text style={styles.tasksTitle}>Tarefas pendentes</Text>
                  {tarefas.map((tarefa, index) => (
                    <View key={tarefa.titulo} style={styles.taskRow}>
                      <View style={styles.checkbox} />
                      <View style={styles.taskBody}>
                        <Text style={styles.taskTitle}>{tarefa.titulo}</Text>
                        <Text style={styles.taskMeta}>{tarefa.disciplina}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Conrad Virtual School. Todos os direitos reservados.</Text>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 18,
  },
  brand: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 36,
    letterSpacing: 0.6,
  },
  navWrap: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
  },
  navItem: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    textTransform: "lowercase",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  userButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.09)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 220,
    backgroundColor: "#11294b",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sidebarCardTitle: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  sidebarTitle: {
    color: COLORS.white,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 18,
  },
  sideMenu: {
    gap: 4,
  },
  sideItem: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  sideItemActive: {
    backgroundColor: COLORS.orange,
    color: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: FONTS.bodyBold,
    marginVertical: 4,
  },
  sideActionGroup: {
    marginTop: 18,
  },
  sideAction: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sideActionText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    marginBottom: 4,
  },
  sideActionSub: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  sideSupport: {
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  sideSupportText: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  profileCard: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  profileText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  profileSub: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
  main: {
    flex: 1,
    backgroundColor: "#dfe5ea",
  },
  mainContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  greetingCard: {
    backgroundColor: "#edf1f5",
    borderWidth: 1,
    borderColor: "#dfe5ea",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  greetingTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 28,
  },
  greetingSubtitle: {
    color: "#5f6d80",
    fontFamily: FONTS.body,
    fontSize: 13,
    marginTop: 6,
  },
  contentGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  scheduleCard: {
    flex: 2.1,
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dfe5ea",
    padding: 16,
  },
  cardTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 28,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe5ea",
    paddingBottom: 8,
    marginBottom: 8,
  },
  dayHeader: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    flex: 1,
    textAlign: "center",
  },
  tableRows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 42,
    borderBottomWidth: 1,
    borderBottomColor: "#e5eaf0",
    paddingBottom: 8,
  },
  rowHighlight: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  time: {
    width: 52,
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  subjectWrap: {
    flex: 1,
    paddingLeft: 12,
  },
  subject: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 13,
  },
  subjectHighlight: {
    fontFamily: FONTS.bodyBold,
  },
  local: {
    color: "#5f6d80",
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
  sidebarCards: {
    flex: 1,
    gap: 14,
  },
  infoCard: {
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dfe5ea",
    padding: 14,
  },
  infoTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 24,
    marginBottom: 10,
  },
  noticeRow: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5eaf0",
  },
  noticeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dfe7f6",
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  badgeEvent: {
    backgroundColor: "#dfe7f6",
  },
  badgeComunicado: {
    backgroundColor: "#dfe7f6",
  },
  noticeText: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 18,
  },
  noticeTime: {
    color: "#5f6d80",
    fontFamily: FONTS.body,
    fontSize: 11,
    marginTop: 4,
  },
  frequencyCard: {
    backgroundColor: "#111f3c",
    borderRadius: 10,
    padding: 14,
  },
  frequencyTitle: {
    color: COLORS.white,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 24,
    marginBottom: 8,
  },
  frequencyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  donutWrap: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  donut: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0f6d59",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    borderColor: "#7fe0be",
  },
  donutValue: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
  },
  frequencyTextWrap: {
    flex: 1,
  },
  frequencyValue: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    marginBottom: 2,
  },
  frequencyMeta: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  tasksCard: {
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dfe5ea",
    padding: 14,
  },
  tasksTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 22,
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5eaf0",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#6d7380",
    backgroundColor: "transparent",
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 18,
  },
  taskMeta: {
    color: "#5f6d80",
    fontFamily: FONTS.body,
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    backgroundColor: COLORS.navy,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 11,
  },
});
