import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../src/AuthContext";
import { COLORS, FONTS } from "../src/theme";

const navItems = ["inicio", "sobre", "contato"];

export default function AgendaProfessor() {
  const router = useRouter();
  const { usuario, checking } = useAuth();

  useEffect(() => {
    if (checking) return;
    if (!usuario) {
      router.replace("/login");
      return;
    }
    if (usuario.tipo !== "educador") {
      router.replace("/aluno");
    }
  }, [checking, usuario, router]);

  const professor = useMemo(() => {
    const nome = usuario?.nome || "Rickson Jordan";
    const initials = nome
      .split(" ")
      .map((parte) => parte[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return {
      nome,
      initials,
      cargo: usuario?.tipo === "educador" ? "Educador" : "Professor",
      turmas: usuario?.turmas ?? 4,
    };
  }, [usuario]);

  const agenda = useMemo(
    () => [
      { dia: "Seg", horario: "8:00 • 3° ano", detalhe: "C", tipo: "normal" },
      { dia: "Ter", horario: "9:00 •", detalhe: "Reunião", tipo: "normal" },
      { dia: "Qua", horario: "14:00 • 1°", detalhe: "ano B", tipo: "normal" },
      { dia: "Qui", horario: "11:00 •", detalhe: "Correção", tipo: "normal" },
      { dia: "Sex", horario: "8:00 • 3° ano", detalhe: "C", tipo: "normal" },
      { dia: "Sáb", horario: "9:00 •", detalhe: "Planejamento", tipo: "normal" },
      { dia: "Dom", horario: "Livre", detalhe: "", tipo: "livre" },
    ],
    []
  );

  if (checking || !usuario || usuario.tipo !== "educador") {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.navy} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.pageShell}>
          <View style={styles.topBar}>
            <Text style={styles.brand}>CONRAD</Text>
            <View style={styles.navWrap}>
              {navItems.map((item) => (
                <Text key={item} style={styles.navItem}>
                  {item}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.workspace}>
            <View style={styles.sidebar}>
              <View style={styles.sidebarTitleWrap}>
                <Text style={styles.sidebarTitle}>CONRAD EDUCADOR</Text>
              </View>

              <View style={styles.menuList}>
                <Text style={styles.menuItem}>Painel</Text>
                <Text style={styles.menuItem}>Minhas turmas</Text>
                <Text style={styles.menuItem}>Avaliações</Text>
                <Text style={[styles.menuItem, styles.menuItemActive]}>Agenda</Text>
                <Text style={styles.menuItem}>Mensagens</Text>
              </View>

              <View style={styles.userCard}>
                <View style={styles.avatar}>{professor.initials}</View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{professor.nome}</Text>
                  <Text style={styles.userRole}>{professor.cargo}</Text>
                </View>
              </View>
            </View>

            <View style={styles.mainArea}>
              <View style={styles.heroCard}>
                <View style={styles.heroTextWrap}>
                  <Text style={styles.pageTitle}>AGENDA DO PROFESSOR</Text>
                  <Text style={styles.pageSubtitle}>Visão semanal rápida das suas turmas e compromissos</Text>
                </View>

                <View style={styles.teacherBadge}>
                  <View style={styles.avatarSmall}>{professor.initials}</View>
                  <View>
                    <Text style={styles.badgeName}>{professor.nome}</Text>
                    <Text style={styles.badgeRole}>{professor.cargo}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.contentGrid}>
                <View style={styles.calendarPanel}>
                  <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>CALENDÁRIO</Text>
                    <Pressable style={styles.backButton}>
                      <Ionicons name="arrow-back" size={14} color={COLORS.navy} />
                      <Text style={styles.backButtonText}>Voltar ao painel</Text>
                    </Pressable>
                  </View>

                  <View style={styles.buttonWrap}>
                    <Pressable style={styles.addButton}>
                      <Text style={styles.addButtonText}>+ Novo evento</Text>
                    </Pressable>
                  </View>

                  <View style={styles.daysGrid}>
                    {agenda.map((item) => (
                      <View
                        key={item.dia}
                        style={[
                          styles.dayCard,
                          item.tipo === "livre" && styles.dayCardFree,
                        ]}
                      >
                        <Text style={styles.dayLabel}>{item.dia}</Text>
                        {item.tipo === "livre" ? (
                          <Text style={styles.dayTextFree}>{item.horario}</Text>
                        ) : (
                          <>
                            <Text style={styles.dayText}>{item.horario}</Text>
                            <Text style={styles.dayText}>{item.detalhe}</Text>
                          </>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.summaryPanel}>
                  <Text style={styles.summaryTitle}>RESUMO</Text>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Turmas</Text>
                    <Text style={styles.summaryValue}>{professor.turmas}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Conrad Virtual School. Todos os direitos reservados.</Text>
          </View>
        </View>
      </ScrollView>
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
  screen: {
    flex: 1,
    backgroundColor: "#dfe5ea",
  },
  content: {
    flexGrow: 1,
  },
  pageShell: {
    width: "100%",
    minHeight: "100%",
    backgroundColor: "#dfe5ea",
  },
  topBar: {
    backgroundColor: COLORS.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  brand: {
    color: COLORS.white,
    fontFamily: FONTS.display,
    fontSize: 34,
    letterSpacing: 0.5,
  },
  navWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navItem: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.white,
    textTransform: "lowercase",
  },
  workspace: {
    flexDirection: "row",
    backgroundColor: "#dfe5ea",
    minHeight: 560,
  },
  sidebar: {
    width: 188,
    backgroundColor: "#0f2348",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 14,
    justifyContent: "flex-start",
  },
  sidebarTitleWrap: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sidebarTitle: {
    color: COLORS.white,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 17,
    lineHeight: 20,
  },
  menuList: {
    gap: 10,
    marginTop: 4,
  },
  menuItem: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 15,
    paddingVertical: 4,
    paddingLeft: 2,
  },
  menuItemActive: {
    backgroundColor: COLORS.orange,
    color: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FONTS.bodyBold,
    marginTop: 4,
    marginBottom: 2,
  },
  userCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  userInfo: {
    flexShrink: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#b7a5ff",
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#b7a5ff",
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  userName: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
  },
  userRole: {
    color: "#dfe7f6",
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
  mainArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  heroCard: {
    backgroundColor: "#edf1f5",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#dde5ee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  pageTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 24,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    color: "#5c6a7f",
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 6,
  },
  teacherBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  badgeName: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
  },
  badgeRole: {
    color: "#5c6a7f",
    fontFamily: FONTS.body,
    fontSize: 11,
    marginTop: 2,
  },
  contentGrid: {
    flexDirection: "row",
    gap: 14,
  },
  calendarPanel: {
    flex: 2.5,
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dfe5ea",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 26,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#d2d7db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
  },
  backButtonText: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  buttonWrap: {
    alignItems: "flex-start",
    marginBottom: 14,
  },
  addButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
  },
  daysGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "nowrap",
  },
  dayCard: {
    flex: 1,
    minWidth: 56,
    minHeight: 96,
    backgroundColor: "#e7edf4",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#dde4ee",
    justifyContent: "flex-start",
  },
  dayCardFree: {
    backgroundColor: "#e5ecf4",
    borderColor: "#dfe5ea",
  },
  dayLabel: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    marginBottom: 8,
  },
  dayText: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 16,
  },
  dayTextFree: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
  summaryPanel: {
    flex: 0.9,
    backgroundColor: "#f3f5f7",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dfe5ea",
  },
  summaryTitle: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 24,
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: "#edf1f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#dde4ee",
  },
  summaryLabel: {
    color: COLORS.navy,
    fontFamily: FONTS.body,
    fontSize: 15,
  },
  summaryValue: {
    color: COLORS.navy,
    fontFamily: FONTS.bodyBold,
    fontSize: 20,
    marginTop: 6,
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
    fontSize: 11,
  },
});
