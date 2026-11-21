import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import horarios from "../src/data/data-horarios";
import { api } from "../src/api";
import { useAuth } from "../src/AuthContext";
import { dataBR } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import Page, { Badge, Card, Empty, Title } from "../src/ui/page";
import { useApi } from "../src/api";

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export default function PainelAluno() {
  const { usuario } = useAuth();
  const router = useRouter();
  const ativ = useApi(() => api.atividadesAluno(), []);

  useFocusEffect(
    useCallback(() => {
      ativ.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const lista = ativ.data?.atividades || [];
  const pendentes = lista.filter((a) => !a.enviada_em && !a.tempo_esgotado);
  const enviadas = lista.filter((a) => a.enviada_em && !a.corrigida_em);
  const corrigidas = lista.filter((a) => a.corrigida_em);

  const hoje = horarios[DIAS[new Date().getDay()]] || [];

  return (
    <Page onRefresh={ativ.reload}>
      <Title sub="Resumo do seu dia">Olá, {usuario.nome.split(" ")[0]}</Title>

      <View style={styles.stats}>
        <Stat n={ativ.loading ? "–" : pendentes.length} label="Pendentes" />
        <Stat n={ativ.loading ? "–" : enviadas.length} label="Enviadas" />
        <Stat n={ativ.loading ? "–" : corrigidas.length} label="Corrigidas" />
      </View>

      <Card>
        <View style={styles.rowHead}>
          <Text style={styles.cardTitle}>Aulas de hoje</Text>
          <Pressable onPress={() => router.push("/horario")}>
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
          <Pressable onPress={() => router.push("/atividades")}>
            <Text style={styles.link}>Ver todas</Text>
          </Pressable>
        </View>
        {ativ.error ? <Empty text={ativ.error} /> : pendentes.length === 0 ? (
          <Empty text="Nenhuma tarefa pendente. 🎉" />
        ) : (
          pendentes.slice(0, 4).map((a) => (
            <Pressable key={a.id} style={styles.aula} onPress={() => router.push(`/atividade/${a.id}`)}>
              <Ionicons name="ellipse-outline" size={18} color={COLORS.navy} />
              <View style={{ flex: 1 }}>
                <Text style={styles.materia}>{a.titulo}</Text>
                <Text style={styles.sala}>{a.disciplina}{a.data_aplicacao ? ` · ${dataBR(a.data_aplicacao)}` : ""}</Text>
              </View>
              <Badge label={a.tipo === "avaliacao" ? "Prova" : "Atividade"} />
            </Pressable>
          ))
        )}
      </Card>
    </Page>
  );
}

function Stat({ n, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 10, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  statN: { fontFamily: FONTS.bodyExtraBold, fontSize: 26, color: COLORS.white },
  statL: { fontFamily: FONTS.bodyBold, fontSize: 11, color: "#dfe7f6", marginTop: 2 },
  rowHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.navy, marginBottom: 8 },
  link: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange },
  aula: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#eef1f4" },
  hora: { width: 46, fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.navy },
  materia: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.navy },
  sala: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
});