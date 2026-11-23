// ============================================================================
// app/sobre.js — página institucional "Sobre" (rota pública "/sobre")
// Equivale a pages/sobre.html do Web: apresentação, "O que move a Conrad",
// os três valores (propósito, visão e princípios) e o convite para falar com a equipe.
// Todos os textos foram copiados do HTML do Web; não há chamadas ao servidor.
// ============================================================================
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS, FONTS } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";

// Pilares exibidos no destaque (.sobre-pilares).
const PILARES = ["Conexão", "Organização", "Aprendizagem"];

// Os três valores (.sobre-valor): [número, título, descrição].
const BLOCOS = [
  ["01", "Nosso propósito", "Facilitar o acesso à educação e aproximar as pessoas que fazem parte dela, com ferramentas simples para o dia a dia escolar."],
  ["02", "Onde queremos chegar", "Ser uma parceira confiável para escolas e estudantes, tornando o ensino digital mais organizado, acessível e humano."],
  ["03", "O que nos guia", "Respeito, transparência e cuidado com cada pessoa — com atenção à segurança e ao ritmo de quem aprende."],
];

export default function Sobre() {
  const styles = useStyles();
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }} contentContainerStyle={{ padding: 18 }}>
      {/* Apresentação (.sobre-hero) */}
      <View style={styles.hero}>
        <Text style={styles.kicker}>EDUCAÇÃO QUE APROXIMA</Text>
        <Text style={styles.heroS}>Aprender conecta</Text>
        <Text style={styles.heroT}>O FUTURO COMEÇA AQUI</Text>
        <Text style={styles.heroP}>
          A Conrad Virtual School reúne alunos, professores e coordenação em um só lugar. Mais organização para a escola, mais clareza para quem ensina e uma experiência de aprendizagem mais próxima para todos.
        </Text>
      </View>

      {/* Destaque (.sobre-destaque) */}
      <View style={styles.destaque}>
        <Text style={styles.destaqueMarca}>C</Text>
        <Text style={styles.destaqueLegenda}>O que move a Conrad</Text>
        <Text style={styles.destaqueT}>Tecnologia com propósito. Educação com pessoas no centro.</Text>
        <View style={styles.pilares}>
          {PILARES.map((p) => (
            <Text key={p} style={styles.pilar}>{p}</Text>
          ))}
        </View>
      </View>

      {/* Nossa essência (.sobre-essencia) */}
      <Text style={styles.kickerEscuro}>NOSSA ESSÊNCIA</Text>
      <Text style={styles.h2}>Um jeito melhor de aprender e ensinar</Text>
      <Text style={styles.intro}>Construímos uma experiência digital que valoriza cada etapa da jornada escolar.</Text>
      {BLOCOS.map(([n, t, d]) => (
        <View key={n} style={styles.card}>
          <Text style={styles.n}>{n}</Text>
          <Text style={styles.t}>{t}</Text>
          <Text style={styles.d}>{d}</Text>
        </View>
      ))}

      {/* Convite (.sobre-convite) */}
      <View style={styles.convite}>
        <Text style={styles.kickerEscuro}>FAÇA PARTE</Text>
        <Text style={styles.conviteT}>A educação fica melhor quando caminhamos juntos.</Text>
        <Pressable style={styles.cta} onPress={() => router.push("/contato")} accessibilityRole="button">
          <Text style={styles.ctaT}>Fale com a gente →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles(() => ({
  hero: { backgroundColor: COLORS.navy, borderRadius: 14, padding: 20, marginBottom: 14 },
  kicker: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.orange, letterSpacing: 1 },
  heroS: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.white, marginTop: 6 },
  heroT: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.orange, marginBottom: 6 },
  heroP: { fontFamily: FONTS.body, fontSize: 14, color: "#dfe7f6", lineHeight: 21 },
  destaque: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 18, marginBottom: 20 },
  destaqueMarca: { fontFamily: FONTS.display, fontSize: 48, color: COLORS.orange, lineHeight: 50 },
  destaqueLegenda: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: "uppercase" },
  destaqueT: { fontFamily: FONTS.bodyExtraBold, fontSize: 17, color: COLORS.text, marginTop: 6, lineHeight: 24 },
  pilares: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  pilar: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text, backgroundColor: COLORS.chip, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: "hidden" },
  kickerEscuro: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.orange, letterSpacing: 1 },
  h2: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.text, marginTop: 4 },
  intro: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, marginBottom: 12, lineHeight: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12 },
  n: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.orange },
  t: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text, marginTop: 2 },
  d: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, marginTop: 4, lineHeight: 20 },
  convite: { backgroundColor: COLORS.backgroundAlt, borderRadius: 14, padding: 18, marginTop: 6, marginBottom: 24 },
  conviteT: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text, marginVertical: 6, lineHeight: 28 },
  cta: { alignSelf: "flex-start", backgroundColor: COLORS.orange, borderRadius: 999, minHeight: 44, paddingHorizontal: 20, justifyContent: "center", marginTop: 6 },
  ctaT: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.white },
}));
