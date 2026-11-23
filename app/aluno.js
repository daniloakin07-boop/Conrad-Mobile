// ============================================================================
// app/aluno.js — PAINEL DO ALUNO (aba "Painel" para contas do tipo aluno)
// Equivale a pages/aluno.html + JS/aluno.js e a pages/dashboard.html + JS/horarios.js.
// Dados reais: GET /api/aluno/atividades (api.atividadesAluno).
//   • Média geral  → média das notas corrigidas convertidas para a escala 0–10
//                    (nota / valor_maximo * 10), a mesma conta de JS/aluno.js.
//   • Pendentes    → atividades ainda sem resposta enviada (!enviada_em).
//   • Enviadas / Corrigidas → atividades com entrega aguardando ou já com correção.
// "Aulas de hoje" vem da grade estática src/data/data-horarios.js (cópia de
// data/horarios.json do Web, que também é estática).
// Os cartões "Frequência" e "Avisos" do HTML do Web usam números fixos de exemplo
// (92% e 3), sem rota no servidor; por isso NÃO foram reproduzidos aqui.
// ============================================================================
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { api, useApi } from "../src/api";
import { useAuth } from "../src/AuthContext";
import horarios from "../src/data/data-horarios";
import { dataBR, pts } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";
import Page, { Badge, Card, Empty, Title } from "../src/ui/page";

// Índice de Date.getDay() (0 = domingo) → chave usada na grade de horários.
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

// "Bom dia / Boa tarde / Boa noite" conforme a hora do aparelho (como no Web).
function saudacao() {
  const hora = new Date().getHours();
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
}

// Média geral 0–10 das atividades já corrigidas; null se ainda não há notas.
function mediaGeral(lista) {
  const notas = lista
    .filter((a) => a.nota != null && Number(a.valor_maximo) > 0)
    .map((a) => (Number(a.nota) / Number(a.valor_maximo)) * 10);
  if (!notas.length) return { media: null, quantidade: 0 };
  return { media: notas.reduce((x, y) => x + y, 0) / notas.length, quantidade: notas.length };
}

export default function PainelAluno() {
  const styles = useStyles();
  const { usuario } = useAuth();
  const router = useRouter();
  const ativ = useApi(() => api.atividadesAluno(), []);

  // Ao voltar de uma entrega, recarrega os contadores.
  useFocusEffect(
    useCallback(() => {
      ativ.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const lista = ativ.data?.atividades || [];
  const pendentes = lista.filter((a) => !a.enviada_em);
  const enviadas = lista.filter((a) => a.enviada_em && !a.corrigida_em);
  const corrigidas = lista.filter((a) => a.corrigida_em);
  const { media, quantidade } = mediaGeral(lista);

  const hoje = horarios[DIAS[new Date().getDay()]] || [];

  return (
    <Page onRefresh={ativ.reload}>
      <Title sub="Resumo das suas notas e pendências">{saudacao()}, {String(usuario?.nome || "Aluno").trim().split(/\s+/)[0]}</Title>

      {/* Média geral (cartão em destaque) */}
      <Card style={styles.media}>
        <Text style={styles.mediaL}>Média geral</Text>
        <Text style={styles.mediaN}>{ativ.loading ? "–" : media != null ? pts(media.toFixed(1)) : "—"}</Text>
        <Text style={styles.mediaS}>
          {media != null ? `Média de ${quantidade} atividade(s) corrigida(s)` : "Ainda sem notas lançadas"}
        </Text>
      </Card>

      <View style={styles.stats}>
        <Stat n={ativ.loading ? "–" : pendentes.length} label="Pendentes" />
        <Stat n={ativ.loading ? "–" : enviadas.length} label="Enviadas" />
        <Stat n={ativ.loading ? "–" : corrigidas.length} label="Corrigidas" />
      </View>

      <Card>
        <View style={styles.rowHead}>
          <Text style={styles.cardTitle}>Aulas de hoje</Text>
          <Pressable onPress={() => router.push("/horario")} hitSlop={8}>
            <Text style={styles.link}>Ver semana</Text>
          </Pressable>
        </View>
        {hoje.length === 0 ? (
          <Empty text="Sem aulas hoje." />
        ) : (
          hoje.map((a, i) => (
            <View key={i} style={styles.aula}>
              <Text style={styles.hora}>{a.hora}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.materia, !a.sala && { color: COLORS.textMuted }]}>{a.materia}</Text>
                {a.sala ? <Text style={styles.sala}>{a.sala} · {a.professor}</Text> : null}
              </View>
            </View>
          ))
        )}
      </Card>

      <Card>
        <View style={styles.rowHead}>
          <Text style={styles.cardTitle}>Tarefas pendentes</Text>
          <Pressable onPress={() => router.push("/atividades")} hitSlop={8}>
            <Text style={styles.link}>Ver todas</Text>
          </Pressable>
        </View>
        {ativ.error ? <Empty text={ativ.error} /> : pendentes.length === 0 ? (
          <Empty text="Nenhuma tarefa pendente. 🎉" />
        ) : (
          pendentes.slice(0, 4).map((a) => (
            <Pressable key={a.id} style={styles.aula} onPress={() => router.push(`/atividade/${a.id}`)}>
              <Ionicons name="ellipse-outline" size={18} color={COLORS.text} />
              <View style={{ flex: 1 }}>
                <Text style={styles.materia}>{a.titulo}</Text>
                <Text style={styles.sala}>{a.disciplina}{a.data_aplicacao ? ` · Prazo ${dataBR(a.data_aplicacao)}` : ""}</Text>
              </View>
              <Badge label={a.tipo === "avaliacao" ? "Prova" : "Atividade"} />
            </Pressable>
          ))
        )}
      </Card>
    </Page>
  );
}

// Cartão numérico do topo do painel.
function Stat({ n, label }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  media: { backgroundColor: COLORS.navy, alignItems: "center" },
  mediaL: { fontFamily: FONTS.bodyBold, fontSize: 12, color: "#dfe7f6" },
  mediaN: { fontFamily: FONTS.display, fontSize: 52, color: COLORS.white },
  mediaS: { fontFamily: FONTS.body, fontSize: 12, color: "#dfe7f6" },
  stats: { flexDirection: "row", gap: 10, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  statN: { fontFamily: FONTS.bodyExtraBold, fontSize: 26, color: COLORS.white },
  statL: { fontFamily: FONTS.bodyBold, fontSize: 11, color: "#dfe7f6", marginTop: 2 },
  rowHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text, marginBottom: 8 },
  link: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange },
  aula: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, minHeight: 44, borderTopWidth: 1, borderTopColor: COLORS.hairline },
  hora: { width: 46, fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text },
  materia: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.text },
  sala: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
}));
