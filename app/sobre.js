import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";

const BLOCOS = [
  ["01", "Nosso propósito", "Facilitar o acesso à educação e aproximar as pessoas que fazem parte dela, com ferramentas simples para o dia a dia escolar."],
  ["02", "Onde queremos chegar", "Ser uma parceira confiável para escolas e estudantes, tornando o ensino digital mais organizado, acessível e humano."],
  ["03", "O que nos guia", "Respeito, transparência e cuidado com cada pessoa — com atenção à segurança e ao ritmo de quem aprende."],
];

export default function Sobre() {
  const styles = useStyles();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }} contentContainerStyle={{ padding: 18 }}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>EDUCAÇÃO QUE APROXIMA</Text>
        <Text style={styles.heroT}>O FUTURO COMEÇA AQUI</Text>
        <Text style={styles.heroP}>
          A Conrad Virtual School reúne alunos, professores e coordenação em um só lugar. Mais organização para a escola, mais clareza para quem ensina e uma experiência de aprendizagem mais próxima para todos.
        </Text>
      </View>
      <Text style={styles.h2}>Um jeito melhor de aprender e ensinar</Text>
      {BLOCOS.map(([n, t, d]) => (
        <View key={n} style={styles.card}>
          <Text style={styles.n}>{n}</Text>
          <Text style={styles.t}>{t}</Text>
          <Text style={styles.d}>{d}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const useStyles = makeStyles(() => ({
  hero: { backgroundColor: COLORS.navy, borderRadius: 14, padding: 20, marginBottom: 18 },
  kicker: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.orange, letterSpacing: 1 },
  heroT: { fontFamily: FONTS.display, fontSize: 34, color: COLORS.white, marginVertical: 6 },
  heroP: { fontFamily: FONTS.body, fontSize: 14, color: "#dfe7f6", lineHeight: 21 },
  h2: { fontFamily: FONTS.display, fontSize: 24, color: COLORS.text, marginBottom: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 12 },
  n: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.orange },
  t: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text, marginTop: 2 },
  d: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, marginTop: 4, lineHeight: 20 },
}));