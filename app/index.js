// ============================================================================
// app/index.js — HOME pública (rota "/")
// Equivale a index.html do Web: hero com chamadas Criar conta/Entrar, contador do Projeto
// Integrador, seção "Recursos" e rodapé com link para o contato.
// ============================================================================
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Button from "../src/components/Button";
import ContadorProjeto from "../src/components/ContadorProjeto";
import FeatureCard from "../src/components/FeatureCard";
import { COLORS, FONTS, SPACING } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";

const student1 = require("../assets/images/hero-student-1.png");
const student2 = require("../assets/images/hero-student-2.png");
const student3 = require("../assets/images/hero-student-3.png");

// Os 6 recursos de index.html (mesmos títulos e textos do Web).
const RECURSOS = [
  { icon: "people-outline", title: "Gestão de Turmas", description: "Organize turmas, disciplinas e alunos facilmente." },
  { icon: "clipboard-outline", title: "Atividades e Avaliações", description: "Crie tarefas, aplique avaliações e acompanhe entregas." },
  { icon: "trending-up-outline", title: "Relatórios Inteligentes", description: "Visualize desempenho, frequência e evolução dos estudantes." },
  { icon: "calendar-outline", title: "Calendário Escolar", description: "Agenda integrada com aulas, eventos e prazos." },
  { icon: "shield-checkmark-outline", title: "Segurança", description: "Dados protegidos por criptografia e armazenamento seguro." },
  { icon: "chatbubble-ellipses-outline", title: "Comunicação", description: "Mensagens, avisos e notificações entre escola, professores e alunos." },
];

export default function Home() {
  const styles = useStyles();
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <LinearGradient colors={[COLORS.heroFrom, COLORS.heroTo]} style={styles.hero}>
        <Text style={styles.heroTitle}>A plataforma completa para transformar a educação digital</Text>
        <Text style={styles.heroSubtitle}>
          Conecte alunos, professores e coordenação em um único ambiente moderno, intuitivo e seguro. Gerencie aulas,
          atividades, avaliações, comunicação e desempenho escolar em tempo real.
        </Text>

        <View style={styles.heroBotoes}>
          <Button label="Criar conta" variant="cta" onPress={() => router.push("/cadastro")} />
          <Button label="Entrar" variant="outline" onPress={() => router.push("/login")} />
        </View>

        <View style={styles.heroImagens}>
          <Image source={student2} style={[styles.heroImg, styles.heroImgBack]} resizeMode="contain" accessibilityLabel="Estudante interagindo com conteúdo digital" />
          <Image source={student1} style={[styles.heroImg, styles.heroImgFront]} resizeMode="contain" accessibilityLabel="Estudante concentrado em uma atividade escolar" />
          <Image source={student3} style={[styles.heroImg, styles.heroImgBack]} resizeMode="contain" accessibilityLabel="Ambiente escolar com materiais de estudo" />
        </View>
      </LinearGradient>

      <ContadorProjeto />

      <View style={styles.recursos}>
        <Text style={styles.recursosBadge}>Recursos</Text>
        <View style={styles.recursosGrid}>
          {RECURSOS.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Conrad Virtual School. Todos os direitos reservados.</Text>
        <Pressable onPress={() => router.push("/contato")} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.footerLink}>Entre em contato</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles(() => ({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },

  hero: { paddingTop: 36, paddingHorizontal: 24, paddingBottom: 0, overflow: "hidden" },
  heroTitle: { fontFamily: FONTS.display, color: COLORS.heroText, fontSize: 36, lineHeight: 38, marginBottom: 14 },
  heroSubtitle: { fontFamily: FONTS.body, color: COLORS.heroSub, fontSize: 15, lineHeight: 25, marginBottom: SPACING.lg },
  heroBotoes: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  heroImagens: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", height: 190, marginTop: 4 },
  heroImg: { height: 190, width: 130 },
  heroImgFront: { zIndex: 2, marginHorizontal: -18 },
  heroImgBack: { zIndex: 1 },

  recursos: { backgroundColor: COLORS.backgroundAlt, paddingHorizontal: 16, paddingTop: 28, paddingBottom: 36, alignItems: "center" },
  recursosBadge: {
    fontFamily: FONTS.display,
    fontSize: 26,
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: 18,
  },
  recursosGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", width: "100%" },

  footer: { backgroundColor: "#0A1F44", paddingVertical: 18, paddingHorizontal: 20, alignItems: "center", gap: 6 },
  footerText: { color: "#cfcfcf", fontFamily: FONTS.body, fontSize: 12, textAlign: "center" },
  footerLink: { color: COLORS.orange, fontFamily: FONTS.bodyBold, fontSize: 13 },
}));
