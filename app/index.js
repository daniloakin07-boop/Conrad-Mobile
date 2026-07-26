import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../src/components/Button";
import FeatureCard from "../src/components/FeatureCard";
import { COLORS, FONTS, SPACING } from "../src/theme";

const logo = require("../assets/images/logo.png");
const student1 = require("../assets/images/hero-student-1.png");
const student2 = require("../assets/images/hero-student-2.png");
const student3 = require("../assets/images/hero-student-3.png");

// Copy here is a reasonable placeholder — index.html wasn't part of this
// upload, so these four cards are invented to fit an ed-tech "recursos"
// section. Swap in the real copy from the web page whenever you have it.
const FEATURES = [
  {
    icon: <Ionicons name="videocam-outline" size={22} color={COLORS.iconColor} />,
    title: "Aulas ao vivo",
    description: "Encontros semanais com professores, direto no app.",
  },
  {
    icon: <Ionicons name="book-outline" size={22} color={COLORS.iconColor} />,
    title: "Conteúdo interativo",
    description: "Atividades e materiais organizados por turma.",
  },
  {
    icon: <Ionicons name="stats-chart-outline" size={22} color={COLORS.iconColor} />,
    title: "Acompanhamento",
    description: "Progresso visível para alunos e educadores.",
  },
  {
    icon: <Ionicons name="chatbubbles-outline" size={22} color={COLORS.iconColor} />,
    title: "Suporte próximo",
    description: "Fale com a equipe sempre que precisar.",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.topo}>
        <Image source={logo} style={styles.logoSmall} resizeMode="contain" />
        <View style={styles.topoAcoes}>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.topoLink}>Entrar</Text>
          </Pressable>
          <Button
            label="Criar conta"
            variant="cta"
            onPress={() => router.push("/cadastro")}
            style={styles.topoBtn}
          />
        </View>
      </View>

      <LinearGradient colors={[COLORS.navy, COLORS.navyDark]} style={styles.hero}>
        <Text style={styles.heroTitle}>
          Educação que conecta, inspira e{" "}
          <Text style={styles.heroTitleAccent}>transforma</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          A Conrad Virtual School une aulas ao vivo, conteúdo interativo e
          acompanhamento próximo — para alunos e educadores, em um só lugar.
        </Text>

        <View style={styles.heroBotoes}>
          <Button
            label="Criar conta grátis"
            variant="cta"
            onPress={() => router.push("/cadastro")}
          />
          <Button
            label="Já tenho conta"
            variant="outline"
            onPress={() => router.push("/login")}
          />
        </View>

        <View style={styles.heroImagens}>
          <Image source={student2} style={[styles.heroImg, styles.heroImgBack]} resizeMode="contain" />
          <Image source={student1} style={[styles.heroImg, styles.heroImgFront]} resizeMode="contain" />
          <Image source={student3} style={[styles.heroImg, styles.heroImgBack]} resizeMode="contain" />
        </View>
      </LinearGradient>

      <View style={styles.recursos}>
        <Text style={styles.recursosBadge}>RECURSOS</Text>
        <View style={styles.recursosGrid}>
          {FEATURES.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} Conrad Virtual School</Text>
        <Pressable onPress={() => router.push("/contato")}>
          <Text style={styles.footerLink}>Fale conosco</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },

  topo: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoSmall: { width: 96, height: 42 },
  topoAcoes: { flexDirection: "row", alignItems: "center", gap: 14 },
  topoLink: {
    color: COLORS.white,
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
  },
  topoBtn: { paddingVertical: 8, paddingHorizontal: 16 },

  hero: {
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 0,
    overflow: "hidden",
  },
  heroTitle: {
    fontFamily: FONTS.display,
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 36,
    marginBottom: 14,
  },
  heroTitleAccent: { color: COLORS.orange },
  heroSubtitle: {
    fontFamily: FONTS.body,
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: SPACING.lg,
  },
  heroBotoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  heroImagens: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 190,
    marginTop: 4,
  },
  heroImg: { height: 190, width: 130 },
  heroImgFront: { zIndex: 2, marginHorizontal: -18 },
  heroImgBack: { zIndex: 1 },

  recursos: {
    backgroundColor: COLORS.backgroundAlt,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  recursosBadge: {
    fontFamily: FONTS.display,
    fontSize: 15,
    color: COLORS.orange,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.orange,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  recursosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },

  footer: {
    backgroundColor: COLORS.navy,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  footerText: { color: "#cfcfcf", fontFamily: FONTS.body, fontSize: 12 },
  footerLink: { color: COLORS.orange, fontFamily: FONTS.bodyBold, fontSize: 12 },
});
