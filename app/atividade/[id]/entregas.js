// ============================================================================
// app/atividade/[id]/entregas.js — ENTREGAS e CORREÇÃO (somente educador)
// Equivale a pages/professor-correcao.html + JS/professor-correcao.js do Web.
// API: GET /api/atividades/:id/entregas (lista) e PUT /api/entregas/:id/correcao
// (grava { nota, feedback }; o servidor confere se a atividade é do professor,
// exige 0 ≤ nota ≤ valor_maximo e grava nota + feedback em uma transação).
// Corrigir de novo apenas atualiza a nota e o feedback.
// No topo da tela ficam também "Editar" e "Excluir atividade" (AcoesAtividade): ao excluir, o
// servidor remove a atividade e as entregas/notas dela e a tela volta para a lista.
// ============================================================================
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { api, useApi } from "../../../src/api";
import AcoesAtividade from "../../../src/components/AcoesAtividade";
import Button from "../../../src/components/Button";
import Message from "../../../src/components/Message";
import { dataHoraBR, num, pts } from "../../../src/format";
import { COLORS, FONTS } from "../../../src/theme";
import { makeStyles } from "../../../src/ui/estilos";
import Page, { Badge, Card, Empty, SoPara, Title } from "../../../src/ui/page";

// Protege a tela: só educadores.
export default function EntregasTela() {
  return (
    <SoPara tipo="educador">
      <Entregas />
    </SoPara>
  );
}

function Entregas() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => api.entregas(id), [id]);

  // Ao voltar da tela de edição, recarrega para mostrar o valor máximo atualizado (a primeira
  // abertura já é carregada pelo useApi; por isso a primeira execução é ignorada).
  const primeiraVez = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeiraVez.current) {
        primeiraVez.current = false;
        return;
      }
      reload();
    }, [reload])
  );
  const entregas = data?.entregas || [];

  return (
    <>
      <Stack.Screen options={{ title: "Entregas" }} />
      <Page loading={loading} error={error} onRefresh={reload}>
        <Title sub={`Valor máximo: ${pts(data?.valor_maximo ?? 0)}`}>Correção</Title>
        <AcoesAtividade
          atividade={{ id, total_entregas: entregas.length }}
          // Atividade excluída: não há mais o que corrigir, volta para a lista (que recarrega ao focar)
          onExcluida={() => router.back()}
        />
        <View style={{ height: 12 }} />
        {entregas.length === 0 ? (
          <Empty text="Nenhum aluno enviou resposta ainda." />
        ) : (
          entregas.map((e) => <Entrega key={e.id} e={e} valorMaximo={data.valor_maximo} onSaved={reload} />)
        )}
      </Page>
    </>
  );
}

// Cartão de uma entrega: resposta do aluno + campos de nota e feedback.
// @param {object} e            entrega (id, aluno, resposta, enviada_em, nota, feedback, corrigida_em)
// @param {number} valorMaximo  limite superior da nota
// @param {Function} onSaved    recarrega a lista depois de salvar
function Entrega({ e, valorMaximo, onSaved }) {
  const s = useS();
  const [nota, setNota] = useState(e.nota != null ? String(e.nota) : "");
  const [feedback, setFeedback] = useState(e.feedback || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function salvar() {
    setMsg(null);
    const v = num(nota);
    // Mesma regra do Web e do servidor: a nota deve ficar entre 0 e o valor máximo.
    if (nota === "" || !Number.isFinite(v) || v < 0 || v > Number(valorMaximo)) {
      return setMsg({ t: "erro", m: `A nota deve ficar entre 0 e ${pts(valorMaximo)}.` });
    }
    setBusy(true);
    try {
      await api.corrigir(e.id, { nota: v, feedback: feedback.trim() });
      setMsg({ t: "sucesso", m: "Correção salva!" });
      onSaved();
    } catch (err) {
      setMsg({ t: "erro", m: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <View style={s.head}>
        <Text style={s.aluno}>{e.aluno}</Text>
        <Badge
          label={e.corrigida_em ? `Corrigida: ${pts(e.nota ?? 0)}/${pts(valorMaximo)}` : "Aguardando"}
          color={e.corrigida_em ? COLORS.successText : COLORS.warnText}
          bg={e.corrigida_em ? COLORS.successBg : COLORS.warnBg}
        />
      </View>
      <Text style={s.data}>Enviada em {dataHoraBR(e.enviada_em)}</Text>
      <Text style={s.resp}>{e.resposta}</Text>
      <TextInput
        style={s.input}
        keyboardType="decimal-pad"
        placeholder={`Nota (0–${pts(valorMaximo)})`}
        placeholderTextColor={COLORS.placeholder}
        value={nota}
        onChangeText={setNota}
      />
      <TextInput
        style={[s.input, { minHeight: 70, textAlignVertical: "top" }]}
        multiline
        placeholder="Feedback para o aluno"
        placeholderTextColor={COLORS.placeholder}
        value={feedback}
        onChangeText={setFeedback}
      />
      <Message type={msg?.t} text={msg?.m} />
      <View style={{ height: 8 }} />
      <Button label={e.corrigida_em ? "Atualizar correção" : "Salvar correção"} onPress={salvar} loading={busy} />
    </Card>
  );
}

const useS = makeStyles(() => ({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  aluno: { flex: 1, fontFamily: FONTS.bodyExtraBold, fontSize: 15, color: COLORS.text },
  data: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2, marginBottom: 8 },
  resp: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.backgroundAlt, borderRadius: 8, padding: 10, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderInput,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 8,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
}));
