import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../src/api";
import Button from "../src/components/Button";
import Message from "../src/components/Message";
import { COLORS, FONTS } from "../src/theme";
import Page, { Badge, Card, Empty, Title } from "../src/ui/page";
import { useApi } from "../src/api";

const LETRAS = "ABCDEF";
const pts = (n) => String(Math.round(Number(n) * 100) / 100).replace(".", ",");
const num = (v) => Number(String(v).replace(",", "."));

export default function Entregas() {
  const { id } = useLocalSearchParams();
  const { data, loading, error, reload } = useApi(() => api.entregas(id), [id]);
  const entregas = data?.entregas || [];

  return (
    <>
      <Stack.Screen options={{ title: "Entregas" }} />
      <Page loading={loading} error={error} onRefresh={reload}>
        <Title sub={`Valor máximo: ${pts(data?.valor_maximo ?? 0)}`}>Correção</Title>
        {entregas.length === 0 ? (
          <Empty text="Nenhum aluno enviou resposta ainda." />
        ) : (
          entregas.map((e) => <Entrega key={e.id} e={e} dados={data} onSaved={reload} />)
        )}
      </Page>
    </>
  );
}

function Entrega({ e, dados, onSaved }) {
  const questoes = dados.questoes || [];
  const comQuestoes = questoes.length > 0;
  const dadas = new Map((e.respostas || []).map((r) => [r.questao_id, r]));

  const [nota, setNota] = useState(e.nota != null ? String(e.nota) : "");
  const [feedback, setFeedback] = useState(e.feedback || "");
  const [pontos, setPontos] = useState(() => {
    const m = {};
    questoes.forEach((q) => { const r = dadas.get(q.id); if (r?.pontos != null) m[q.id] = String(r.pontos); });
    return m;
  });
  const [coments, setComents] = useState(() => {
    const m = {};
    questoes.forEach((q) => { m[q.id] = dadas.get(q.id)?.comentario || ""; });
    return m;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const somaQ = questoes.reduce((s, q) => s + (num(pontos[q.id]) || 0), 0);

  async function salvar() {
    setMsg(null);
    let corpo;
    if (comQuestoes) {
      for (const q of questoes) {
        const t = pontos[q.id];
        if (t === undefined || t === "") {
          if (q.tipo === "discursiva") return setMsg({ t: "erro", m: `Questão ${q.ordem}: dê uma nota (pode ser zero).` });
          continue;
        }
        const v = num(t);
        if (!Number.isFinite(v) || v < 0 || v > Number(q.pontos))
          return setMsg({ t: "erro", m: `Questão ${q.ordem}: a nota deve ficar entre 0 e ${pts(q.pontos)}.` });
      }
      corpo = {
        respostas: questoes.map((q) => ({
          questao_id: q.id,
          pontos: pontos[q.id] === undefined || pontos[q.id] === "" ? undefined : num(pontos[q.id]),
          comentario: coments[q.id],
        })),
        feedback,
      };
    } else {
      const v = num(nota);
      if (nota === "" || !Number.isFinite(v) || v < 0 || v > Number(dados.valor_maximo))
        return setMsg({ t: "erro", m: `A nota deve ficar entre 0 e ${pts(dados.valor_maximo)}.` });
      corpo = { nota: v, feedback };
    }
    setBusy(true);
    try {
      await api.corrigir(e.id, corpo);
      setMsg({ t: "sucesso", m: "Correção salva!" });
      onSaved();
    } catch (err) {
      setMsg({ t: "erro", m: err.message });
    } finally { setBusy(false); }
  }

  return (
    <Card>
      <View style={s.head}>
        <Text style={s.aluno}>{e.aluno}</Text>
        <Badge
          label={e.corrigida_em ? `Corrigida: ${pts(e.nota ?? 0)}/${pts(dados.valor_maximo)}` : "Aguardando"}
          color={e.corrigida_em ? "#1d6b43" : "#8a5a00"}
          bg={e.corrigida_em ? "#dcf3e6" : "#fdf0cf"}
        />
      </View>
      <Text style={s.data}>Enviada em {new Date(e.enviada_em).toLocaleString("pt-BR")}</Text>

      {comQuestoes ? (
        <>
          {questoes.map((q) => {
            const r = dadas.get(q.id) || {};
            return (
              <View key={q.id} style={s.q}>
                <Text style={s.qT}>Questão {q.ordem} · vale {pts(q.pontos)}</Text>
                <Text style={s.p}>{q.enunciado}</Text>
                {q.tipo === "objetiva" ? (
                  <Text style={s.p}>
                    Marcou: {r.alternativa != null ? `${LETRAS[r.alternativa]}) ${q.alternativas?.[r.alternativa] ?? ""}` : "em branco"}
                    {"\n"}Gabarito: {q.correta != null ? `${LETRAS[q.correta]}) ${q.alternativas?.[q.correta] ?? ""}` : "–"}
                  </Text>
                ) : (
                  <Text style={s.resp}>{r.resposta || "Em branco."}</Text>
                )}
                <TextInput style={s.input} keyboardType="decimal-pad" placeholder={`Nota (0–${pts(q.pontos)})`} placeholderTextColor="#9aa1ab"
                  value={pontos[q.id] ?? ""} onChangeText={(v) => setPontos((m) => ({ ...m, [q.id]: v }))} />
                {q.tipo === "discursiva" && (
                  <TextInput style={s.input} placeholder="Comentário (opcional)" placeholderTextColor="#9aa1ab"
                    value={coments[q.id]} onChangeText={(v) => setComents((m) => ({ ...m, [q.id]: v }))} />
                )}
              </View>
            );
          })}
          <Text style={s.total}>Nota total: {pts(somaQ)} / {pts(dados.valor_maximo)}</Text>
        </>
      ) : (
        <>
          <Text style={s.resp}>{e.resposta}</Text>
          <TextInput style={s.input} keyboardType="decimal-pad" placeholder={`Nota (0–${pts(dados.valor_maximo)})`} placeholderTextColor="#9aa1ab" value={nota} onChangeText={setNota} />
        </>
      )}
      <TextInput style={[s.input, { minHeight: 70, textAlignVertical: "top" }]} multiline placeholder="Feedback geral para o aluno" placeholderTextColor="#9aa1ab" value={feedback} onChangeText={setFeedback} />
      <Message type={msg?.t} text={msg?.m} />
      <View style={{ height: 8 }} />
      <Button label={e.corrigida_em ? "Atualizar correção" : "Salvar correção"} onPress={salvar} loading={busy} />
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  aluno: { flex: 1, fontFamily: FONTS.bodyExtraBold, fontSize: 15, color: COLORS.navy },
  data: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2, marginBottom: 8 },
  q: { borderTopWidth: 1, borderTopColor: "#eef1f4", paddingTop: 10, marginTop: 10 },
  qT: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.navy },
  p: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.navy, marginTop: 3, lineHeight: 19 },
  resp: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.navy, backgroundColor: "#f3f5f7", borderRadius: 8, padding: 10, marginTop: 6 },
  input: { borderWidth: 1, borderColor: COLORS.borderInput, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, marginTop: 8, fontFamily: FONTS.body, fontSize: 14, color: COLORS.navy, backgroundColor: COLORS.white },
  total: { fontFamily: FONTS.bodyExtraBold, fontSize: 14, color: COLORS.orange, marginTop: 10 },
});