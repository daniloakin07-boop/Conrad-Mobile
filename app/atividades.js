import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api, useApi } from "../src/api";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import { dataBR, ehEducador, pts } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import Page, { Badge, Card, Chips, Empty, Segmented, Title } from "../src/ui/page";

// Lista de atividades/avaliações. Mesmos filtros do Web (turma + tipo).
//  - educador: suas publicações, com contagem de entregas -> abre a correção
//  - aluno: o que as suas turmas publicaram, com situação -> abre a atividade
export default function Atividades() {
  const { usuario } = useAuth();
  const router = useRouter();
  const educador = ehEducador(usuario);

  const [tipo, setTipo] = useState("atividade");
  const [turmaId, setTurmaId] = useState("");
  const turmasApi = useApi(() => api.turmas(), []);
  const turmas = turmasApi.data?.turmas || [];

  const lista = useApi(async () => {
    const filtros = { tipo, turmaId };
    const r = educador ? await api.atividadesEducador(filtros) : await api.atividadesAluno(filtros);
    return Array.isArray(r) ? r : r.atividades || [];
  }, [tipo, turmaId, educador]);

  // Ao voltar da correção/publicação/entrega, atualiza contagens e status.
  useFocusEffect(
    useCallback(() => {
      lista.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipo, turmaId])
  );

  const itens = lista.data || [];
  const rotulo = tipo === "avaliacao" ? "avaliação" : "atividade";

  return (
    <Page error={lista.error && !lista.data ? lista.error : ""} onRefresh={lista.reload}>
      <Title sub={educador ? "Publique, acompanhe entregas e corrija" : "Suas tarefas e provas"}>
        {tipo === "avaliacao" ? "Avaliações" : "Atividades"}
      </Title>

      <Segmented options={[["atividade", "Atividades"], ["avaliacao", "Avaliações"]]} value={tipo} onChange={setTipo} />

      {turmas.length > 1 && (
        <Chips options={[["", "Todas as turmas"], ...turmas.map((t) => [String(t.id), t.nome])]} value={turmaId} onChange={setTurmaId} />
      )}

      {educador && (
        <View style={{ marginBottom: 12 }}>
          <Button
            label={`+ Nova ${rotulo}`}
            variant="cta"
            onPress={() => router.push({ pathname: "/atividade/nova", params: { tipo, turmaId } })}
          />
        </View>
      )}

      {lista.loading && !lista.data ? (
        <Empty text="Carregando…" />
      ) : itens.length === 0 ? (
        <Empty
          text={
            educador
              ? `Nada publicado por aqui ainda. Toque em “+ Nova ${rotulo}”.`
              : `Nenhuma ${rotulo} publicada nas suas turmas ainda.`
          }
        />
      ) : (
        itens.map((a) => (educador ? <ItemEducador key={a.id} a={a} router={router} /> : <ItemAluno key={a.id} a={a} router={router} />))
      )}
    </Page>
  );
}

function Meta({ a }) {
  return (
    <Text style={s.meta}>
      {a.disciplina} · {a.turma} · Prazo: {dataBR(a.data_aplicacao)} · {pts(a.valor_maximo)} pts
    </Text>
  );
}

function ItemEducador({ a, router }) {
  const total = Number(a.total_entregas || 0);
  const corrigidas = Number(a.corrigidas || 0);
  return (
    <Pressable onPress={() => router.push(`/atividade/${a.id}/entregas`)}>
      <Card>
        <Text style={s.titulo}>{a.titulo}</Text>
        <Meta a={a} />
        <View style={s.rodape}>
          <Badge
            label={total === 0 ? "Sem entregas" : `${corrigidas}/${total} corrigidas`}
            color={total > corrigidas ? COLORS.warnText : COLORS.successText}
            bg={total > corrigidas ? COLORS.warnBg : COLORS.successBg}
          />
          <Text style={s.link}>{total ? "Ver entregas ›" : ""}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

function situacao(a) {
  if (a.corrigida_em) return { t: `Nota ${a.nota != null ? pts(a.nota) : "–"}/${pts(a.valor_maximo)}`, c: COLORS.successText, bg: COLORS.successBg };
  if (a.enviada_em) return { t: "Enviada", c: COLORS.navy, bg: COLORS.chip };
  if (a.tempo_esgotado) return { t: "Tempo esgotado", c: COLORS.error, bg: COLORS.errorBg };
  if (a.iniciada) return { t: "Em andamento", c: COLORS.warnText, bg: COLORS.warnBg };
  return { t: "Pendente", c: COLORS.warnText, bg: COLORS.warnBg };
}

function ItemAluno({ a, router }) {
  const st = situacao(a);
  return (
    <Pressable onPress={() => router.push(`/atividade/${a.id}`)}>
      <Card>
        <Text style={s.titulo}>{a.titulo}</Text>
        <Meta a={a} />
        <View style={s.rodape}>
          <Badge label={st.t} color={st.c} bg={st.bg} />
          {a.tempo_limite_min ? <Text style={s.meta}>{a.tempo_limite_min} min</Text> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const s = StyleSheet.create({
  titulo: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.navy },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  rodape: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  link: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange },
});
