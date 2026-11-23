// ============================================================================
// app/educador.js — PAINEL DO EDUCADOR (aba "Painel" para contas educador)
// Equivale a pages/educador.html + JS/educador.js do Web. Dados reais de GET /api/turmas e
// GET /api/atividades: nº de turmas, total de alunos, entregas a corrigir, atalhos para criar
// atividade/avaliação, "Para corrigir", "Minhas turmas" e "Atividades recentes".
// ============================================================================
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api, useApi } from "../src/api";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import { pts } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import Page, { Badge, Card, Empty, Title } from "../src/ui/page";
import { makeStyles } from "../src/ui/estilos";

export default function PainelEducador() {
  const styles = useStyles();
  const { usuario } = useAuth();
  const router = useRouter();
  const turmas = useApi(() => api.turmas(), []);
  const ativ = useApi(() => api.atividadesEducador(), []);

  const listaTurmas = turmas.data?.turmas || [];
  const listaAtiv = Array.isArray(ativ.data) ? ativ.data : [];
  const totalAlunos = listaTurmas.reduce((s, t) => s + Number(t.quantidade_alunos || 0), 0);
  const pendentes = listaAtiv.filter((a) => Number(a.total_entregas) > Number(a.corrigidas));
  const aCorrigir = pendentes.reduce((s, a) => s + (Number(a.total_entregas) - Number(a.corrigidas)), 0);

  const reload = async () => { await Promise.all([turmas.reload(), ativ.reload()]); };

  // Entregas novas chegam o tempo todo: atualiza ao voltar para o painel.
  useFocusEffect(
    useCallback(() => {
      reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Page onRefresh={reload}>
      <Title sub="Visão geral das suas turmas">Olá, {String(usuario?.nome || "Educador").trim().split(/\s+/)[0]}</Title>

      <View style={styles.stats}>
        <Stat n={turmas.loading ? "–" : listaTurmas.length} label="Turmas" />
        <Stat n={turmas.loading ? "–" : totalAlunos} label="Alunos" />
        <Stat n={ativ.loading ? "–" : aCorrigir} label="A corrigir" />
      </View>

      <View style={styles.acoes}>
        <Button label="+ Atividade" variant="cta" onPress={() => router.push({ pathname: "/atividade/nova", params: { tipo: "atividade" } })} style={{ flex: 1 }} />
        <Button label="+ Avaliação" variant="cta" onPress={() => router.push({ pathname: "/atividade/nova", params: { tipo: "avaliacao" } })} style={{ flex: 1 }} />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Para corrigir</Text>
        {ativ.error ? <Empty text={ativ.error} /> : pendentes.length === 0 ? (
          <Empty text="Nenhuma correção pendente." />
        ) : (
          pendentes.slice(0, 5).map((a) => (
            <Pressable key={a.id} style={styles.row} onPress={() => router.push(`/atividade/${a.id}/entregas`)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{a.titulo}</Text>
                <Text style={styles.meta}>{a.turma} · {pts(a.valor_maximo)} pts</Text>
              </View>
              <Badge label={`${Number(a.total_entregas) - Number(a.corrigidas)} pendente(s)`} color={COLORS.warnText} bg={COLORS.warnBg} />
            </Pressable>
          ))
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Minhas turmas</Text>
        {turmas.error ? <Empty text={turmas.error} /> : listaTurmas.length === 0 ? (
          <Empty text="Você ainda não criou nenhuma turma." />
        ) : (
          listaTurmas.slice(0, 5).map((t) => (
            <Pressable key={t.id} style={styles.row} onPress={() => router.push(`/turma/${t.id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{t.nome}</Text>
                <Text style={styles.meta}>{t.disciplina} · {t.quantidade_alunos} aluno(s)</Text>
              </View>
            </Pressable>
          ))
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Atividades recentes</Text>
        {listaAtiv.length === 0 ? (
          <Empty text="Nenhuma atividade publicada ainda." />
        ) : (
          listaAtiv.slice(0, 5).map((a) => (
            <Pressable key={a.id} style={styles.row} onPress={() => router.push(`/atividade/${a.id}/entregas`)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{a.titulo}</Text>
                <Text style={styles.meta}>{a.turma} · {a.corrigidas}/{a.total_entregas} corrigidas</Text>
              </View>
            </Pressable>
          ))
        )}
      </Card>
    </Page>
  );
}

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
  stats: { flexDirection: "row", gap: 10, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  statN: { fontFamily: FONTS.bodyExtraBold, fontSize: 26, color: COLORS.white },
  statL: { fontFamily: FONTS.bodyBold, fontSize: 11, color: "#dfe7f6", marginTop: 2 },
  acoes: { flexDirection: "row", gap: 10, marginBottom: 12 },
  cardTitle: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, minHeight: 48, borderTopWidth: 1, borderTopColor: COLORS.hairline },
  nome: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.text },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
}));
