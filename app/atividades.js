import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { api, useApi } from "../src/api";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import { dataBR, ehEducador, pts } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import Page, { Badge, Card, Chips, Empty, Segmented, Title } from "../src/ui/page";
import { makeStyles } from "../src/ui/estilos";

// ============================================================================
// app/atividades.js — aba "Atividades" (atividades e avaliações)
// Equivale a pages/atividades.html, avaliacoes.html, aluno-atividades.html e
// professor-correcao.html do Web. Mesmos filtros: tipo (atividade | avaliação) e turma.
//  • educador: lista o que ele publicou (GET /api/atividades), com a contagem de
//    entregas/corrigidas, e abre a correção em /atividade/[id]/entregas;
//  • aluno: lista o que as suas turmas publicaram (GET /api/aluno/atividades), com a
//    situação (Pendente, Enviada ou Nota), e abre /atividade/[id].
// ============================================================================
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

  // Ao voltar da correção, da publicação ou da entrega, atualiza contagens e situação.
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

// Linha de metadados (disciplina, turma, prazo e valor) comum aos dois perfis.
function Meta({ a }) {
  const s = useS();
  return (
    <Text style={s.meta}>
      {a.disciplina} · {a.turma} · Prazo: {dataBR(a.data_aplicacao)} · {pts(a.valor_maximo)} pts
    </Text>
  );
}

// Cartão do educador: progresso de correção da atividade.
function ItemEducador({ a, router }) {
  const s = useS();
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

// Traduz os campos devolvidos pelo servidor na situação exibida ao aluno.
function situacao(a) {
  if (a.corrigida_em) return { t: `Nota ${a.nota != null ? pts(a.nota) : "–"}/${pts(a.valor_maximo)}`, c: COLORS.successText, bg: COLORS.successBg };
  if (a.enviada_em) return { t: "Enviada", c: COLORS.navy, bg: COLORS.chip };
  return { t: "Pendente", c: COLORS.warnText, bg: COLORS.warnBg };
}

// Cartão do aluno: situação da entrega (Pendente / Enviada / Nota).
function ItemAluno({ a, router }) {
  const s = useS();
  const st = situacao(a);
  return (
    <Pressable onPress={() => router.push(`/atividade/${a.id}`)}>
      <Card>
        <Text style={s.titulo}>{a.titulo}</Text>
        <Meta a={a} />
        <View style={s.rodape}>
          <Badge label={st.t} color={st.c} bg={st.bg} />
        </View>
      </Card>
    </Pressable>
  );
}

const useS = makeStyles(() => ({
  titulo: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  rodape: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  link: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange },
}));
