import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useContagemRegressiva } from "../projetoIntegrador";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";

// Seção .pi-web-contador de index.html (CSS/contador-projeto.css), adaptada ao celular:
// texto em cima, temporizador embaixo, quatro caixas lado a lado.
const DETALHES = ["Plataforma Web", "Gestão educacional", "Comunicação em tempo real"];

export default function ContadorProjeto() {
  const styles = useStyles();
  const t = useContagemRegressiva();
  const unidades = [
    ["Dias", t.dias],
    ["Horas", t.horas],
    ["Minutos", t.minutos],
    ["Segundos", t.segundos],
  ];

  return (
    <View style={styles.secao} accessibilityLabel="Contador do Projeto Integrador">
      <LinearGradient colors={["#0A1F44", "#142e5b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.painel}>
        <View style={styles.faixa} />
        <View style={styles.aro} pointerEvents="none" />

        <Text style={styles.etiqueta}>APRESENTAÇÃO • 24.11.2026</Text>
        <Text style={styles.titulo}>
          Projeto Integrador <Text style={styles.tituloAcento}>— Conrad Virtual School</Text>
        </Text>
        <Text style={styles.descricao}>
          Plataforma web de ensino que conecta alunos e educadores em um só ambiente. Organize turmas com códigos de
          acesso, atividades, avaliações, entregas, salas virtuais e comunicação em tempo real.
        </Text>
        <View style={styles.detalhes}>
          {DETALHES.map((d) => (
            <View key={d} style={styles.detalhe}>
              <View style={styles.ponto} />
              <Text style={styles.detalheT}>{d}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.legenda}>CONTAGEM REGRESSIVA</Text>
        <View style={styles.unidades} accessibilityRole="timer" accessibilityLabel="Tempo restante para a apresentação">
          {unidades.map(([rotulo, valor]) => (
            <View key={rotulo} style={styles.unidade}>
              <Text style={styles.valor} adjustsFontSizeToFit numberOfLines={1}>
                {valor}
              </Text>
              <Text style={styles.rotulo}>{rotulo.toUpperCase()}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {t.encerrado ? "Chegou a hora da apresentação!" : "Tempo restante para a apresentação"}
        </Text>
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  secao: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, backgroundColor: COLORS.background },
  painel: {
    borderRadius: 18,
    overflow: "hidden",
    paddingVertical: 24,
    paddingLeft: 24,
    paddingRight: 20,
    borderWidth: 1,
    borderColor: "rgba(10,31,68,0.12)",
    shadowColor: "#0A1F44",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  faixa: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5, backgroundColor: "#F5821F" },
  aro: {
    position: "absolute",
    top: -105,
    right: -65,
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  etiqueta: {
    alignSelf: "flex-start",
    overflow: "hidden",
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: "#ffd6b3",
    backgroundColor: "rgba(245,130,31,0.16)",
    borderWidth: 1,
    borderColor: "rgba(245,130,31,0.42)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 13,
  },
  titulo: { fontFamily: FONTS.display, fontSize: 34, lineHeight: 36, letterSpacing: 0.5, color: "#ffffff", marginBottom: 10 },
  tituloAcento: { color: "#F5821F" },
  descricao: { fontFamily: FONTS.body, fontSize: 14, lineHeight: 24, color: "rgba(255,255,255,0.84)" },
  detalhes: { flexDirection: "row", flexWrap: "wrap", columnGap: 18, rowGap: 8, marginTop: 18, marginBottom: 22 },
  detalhe: { flexDirection: "row", alignItems: "center" },
  ponto: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#F5821F", marginRight: 8 },
  detalheT: { fontFamily: FONTS.bodyBold, fontSize: 12, color: "rgba(255,255,255,0.72)" },
  legenda: {
    fontFamily: FONTS.bodyExtraBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 13,
  },
  unidades: { flexDirection: "row", gap: 9 },
  unidade: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
  },
  valor: { fontFamily: FONTS.display, fontSize: 36, lineHeight: 38, color: "#F5821F", fontVariant: ["tabular-nums"] },
  rotulo: { marginTop: 5, fontFamily: FONTS.bodyExtraBold, fontSize: 9.5, letterSpacing: 0.5, color: "rgba(255,255,255,0.78)" },
  status: { minHeight: 18, marginTop: 12, textAlign: "center", fontFamily: FONTS.bodyBold, fontSize: 12, color: "#ffd6b3" },
}));
