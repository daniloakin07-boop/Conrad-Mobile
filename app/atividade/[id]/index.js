// ============================================================================
// app/atividade/[id]/index.js — ATIVIDADE vista pelo ALUNO (rota "/atividade/45")
// Equivale a pages/aluno-atividades.html + JS/aluno-atividade.js do Web.
// Mostra título, descrição, valor e prazo; permite escrever e enviar a resposta
// (POST /api/atividades/:id/entrega) e exibe nota e feedback depois da correção.
// Regras do servidor respeitadas:
//   • resposta de 1 a 5000 caracteres;
//   • pode ser atualizada até o professor corrigir; depois disso o servidor responde
//     409 ("já foi corrigida") e o campo fica bloqueado aqui também.
// O servidor não tem rota de detalhe por atividade; por isso a tela busca a lista do aluno
// (GET /api/aluno/atividades) e escolhe a atividade pelo id da rota.
// ============================================================================
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { api } from "../../../src/api";
import Button from "../../../src/components/Button";
import Message from "../../../src/components/Message";
import { dataBR, dataHoraBR, pts } from "../../../src/format";
import { COLORS, FONTS } from "../../../src/theme";
import { makeStyles } from "../../../src/ui/estilos";
import Page, { Badge, Card, SoPara, Title } from "../../../src/ui/page";

// Protege a tela: só alunos (o servidor também valida com o middleware soAluno).
export default function AtividadeAlunoTela() {
  return (
    <SoPara tipo="aluno">
      <AtividadeAluno />
    </SoPara>
  );
}

function AtividadeAluno() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carrega (ou recarrega) a atividade a partir da lista do aluno.
  const carregar = useCallback(async () => {
    setError("");
    try {
      const lista = await api.atividadesAluno();
      const a = (lista.atividades || []).find((x) => String(x.id) === String(id));
      if (!a) throw new Error("Atividade não encontrada.");
      setItem(a);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <>
      <Stack.Screen options={{ title: "Atividade" }} />
      <Page loading={loading} error={error} onRefresh={carregar}>
        {item ? <Resposta a={item} recarregar={carregar} /> : null}
      </Page>
    </>
  );
}

// Bloco principal: informações da atividade, resultado (se corrigida) e campo de resposta.
function Resposta({ a, recarregar }) {
  const s = useS();
  const [resp, setResp] = useState(a.resposta || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const corrigida = !!a.corrigida_em;

  // Envia (ou atualiza) a resposta. O servidor valida tamanho, matrícula e se já foi corrigida.
  async function enviar() {
    if (!resp.trim()) return setMsg({ t: "erro", m: "Escreva a sua resposta antes de enviar." });
    setBusy(true);
    setMsg(null);
    try {
      await api.enviarEntrega(a.id, { resposta: resp });
      setMsg({ t: "sucesso", m: "Resposta enviada!" });
      recarregar();
    } catch (e) {
      setMsg({ t: "erro", m: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Title sub={`${a.disciplina} · ${a.turma}`}>{a.titulo}</Title>
      <Card>
        <Text style={s.p}>{a.descricao || "Sem descrição."}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <Badge label={a.tipo === "avaliacao" ? "Avaliação" : "Atividade"} />
          <Badge label={`Vale ${pts(a.valor_maximo)}`} />
          {a.data_aplicacao ? <Badge label={`Prazo: ${dataBR(a.data_aplicacao)}`} /> : null}
        </View>
        {a.enviada_em ? <Text style={s.meta}>Enviada em {dataHoraBR(a.enviada_em)}</Text> : null}
      </Card>

      {corrigida && (
        <Card style={{ backgroundColor: COLORS.successBg }}>
          <Text style={s.nota}>Nota: {a.nota != null ? pts(a.nota) : "–"} / {pts(a.valor_maximo)}</Text>
          {a.feedback ? <Text style={s.p}>Feedback do professor: {a.feedback}</Text> : null}
        </Card>
      )}

      <Card>
        <Text style={s.h}>Sua resposta</Text>
        <TextInput
          style={s.area}
          multiline
          editable={!corrigida}
          value={resp}
          onChangeText={setResp}
          maxLength={5000}
          placeholder="Escreva aqui a sua resposta…"
          placeholderTextColor={COLORS.placeholder}
        />
        <Text style={s.contador}>{resp.length}/5000</Text>
        <Message type={msg?.t} text={msg?.m} />
        {corrigida ? (
          <Text style={s.aviso}>Esta entrega já foi corrigida e não pode ser alterada.</Text>
        ) : (
          <>
            <View style={{ height: 10 }} />
            <Button label={a.enviada_em ? "Atualizar resposta" : "Enviar resposta"} onPress={enviar} loading={busy} />
          </>
        )}
      </Card>
    </>
  );
}

const useS = makeStyles(() => ({
  p: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 20, marginTop: 4 },
  h: { fontFamily: FONTS.bodyExtraBold, fontSize: 15, color: COLORS.text },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  nota: { fontFamily: FONTS.bodyExtraBold, fontSize: 18, color: COLORS.successText },
  aviso: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.error, marginTop: 8 },
  contador: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted2, textAlign: "right", marginTop: 4 },
  area: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: COLORS.borderInput,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text,
    textAlignVertical: "top",
    backgroundColor: COLORS.card,
  },
}));
