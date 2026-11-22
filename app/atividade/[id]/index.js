import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../../../src/api";
import { useAuth } from "../../../src/AuthContext";
import Button from "../../../src/components/Button";
import Message from "../../../src/components/Message";
import { COLORS, FONTS } from "../../../src/theme";
import { dataBR, pts } from "../../../src/format";
import Page, { Badge, Card, SoPara, Title } from "../../../src/ui/page";
import { makeStyles } from "../../../src/ui/estilos";

const LETRAS = "ABCDEF";
const pad = (n) => String(n).padStart(2, "0");
function relogio(seg) {
  const t = Math.max(0, Math.ceil(seg));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function AtividadeAlunoTela() {
  return (
    <SoPara tipo="aluno">
      <AtividadeAluno />
    </SoPara>
  );
}

function AtividadeAluno() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null); // item da lista (modo texto)
  const [det, setDet] = useState(null); // detalhe com questões (se o servidor suportar)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregar = useCallback(async () => {
    setError("");
    try {
      try {
        const d = await api.detalheAluno(id);
        if (d && d.atividade && Number(d.atividade.total_questoes ?? d.questoes?.length ?? 0) > 0) {
          setDet(d);
          setLoading(false);
          return;
        }
      } catch {
        // servidor sem questões: cai no modo resposta de texto
      }
      setDet(null);
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
        {det ? <ModoQuestoes key={det.estado} d={det} recarregar={carregar} /> : item ? <ModoTexto a={item} recarregar={carregar} /> : null}
      </Page>
    </>
  );
}

// ---------- modo texto (uma resposta livre) ----------
function ModoTexto({ a, recarregar }) {
  const s = useS();
  const [resp, setResp] = useState(a.resposta || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const corrigida = !!a.corrigida_em;

  async function enviar() {
    setBusy(true); setMsg(null);
    try {
      await api.enviarEntrega(a.id, { resposta: resp });
      setMsg({ t: "sucesso", m: "Resposta enviada!" });
      recarregar();
    } catch (e) {
      setMsg({ t: "erro", m: e.message });
    } finally { setBusy(false); }
  }

  return (
    <>
      <Title sub={`${a.disciplina} · ${a.turma}`}>{a.titulo}</Title>
      <Card>
        <Text style={s.p}>{a.descricao || "Sem descrição."}</Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
          <Badge label={`Vale ${pts(a.valor_maximo)}`} />
          {a.data_aplicacao ? <Badge label={`Prazo: ${dataBR(a.data_aplicacao)}`} /> : null}
        </View>
      </Card>
      {corrigida && (
        <Card style={{ backgroundColor: COLORS.successBg }}>
          <Text style={s.nota}>Nota: {a.nota != null ? pts(a.nota) : "–"} / {pts(a.valor_maximo)}</Text>
          {a.feedback ? <Text style={s.p}>Feedback: {a.feedback}</Text> : null}
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

// ---------- modo questões (objetivas/discursivas, com cronômetro) ----------
function ModoQuestoes({ d, recarregar }) {
  const s = useS();
  const at = d.atividade;
  const estado = d.estado;
  const { usuario } = useAuth();
  const chaveRascunho = `conrad:rascunho:${usuario?.id}:${at.id}`;
  const [respostas, setRespostas] = useState(() => {
    const m = {};
    (d.respostas || []).forEach((r) => { m[r.questao_id] = { alternativa: r.alternativa ?? null, resposta: r.resposta || "" }; });
    return m;
  });

  // Enquanto a prova está em andamento, guarda o rascunho no aparelho.
  useEffect(() => {
    if (estado !== "em_andamento") return;
    AsyncStorage.getItem(chaveRascunho)
      .then((v) => v && setRespostas((atual) => ({ ...JSON.parse(v), ...atual })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (estado !== "em_andamento") return;
    AsyncStorage.setItem(chaveRascunho, JSON.stringify(respostas)).catch(() => {});
  }, [respostas, estado, chaveRascunho]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [resta, setResta] = useState(d.segundos_restantes);
  const fim = useRef(d.segundos_restantes != null ? Date.now() + d.segundos_restantes * 1000 : null);
  const enviando = useRef(false);

  const editavel = estado === "em_andamento" || (estado === "enviada" && !at.tempo_limite_min);

  const enviar = useCallback(async (auto) => {
    if (enviando.current) return;
    enviando.current = true; setBusy(true); setMsg(null);
    try {
      await api.enviarEntrega(at.id, {
        respostas: (d.questoes || []).map((q) => ({ questao_id: q.id, ...(respostas[q.id] || {}) })),
      });
      AsyncStorage.removeItem(chaveRascunho).catch(() => {});
      await recarregar();
    } catch (e) {
      enviando.current = false;
      setMsg({ t: "erro", m: e.message });
    } finally { setBusy(false); }
  }, [at.id, d.questoes, respostas, recarregar, chaveRascunho]);

  const respRef = useRef(enviar);
  respRef.current = enviar;

  useEffect(() => {
    if (estado !== "em_andamento" || fim.current == null) return;
    const t = setInterval(() => {
      const r = Math.max(0, (fim.current - Date.now()) / 1000);
      setResta(r);
      if (r <= 0) { clearInterval(t); respRef.current(true); }
    }, 500);
    return () => clearInterval(t);
  }, [estado]);

  function confirmarEnvio() {
    const branco = (d.questoes || []).filter((q) => {
      const r = respostas[q.id] || {};
      return q.tipo === "objetiva" ? r.alternativa == null : !String(r.resposta || "").trim();
    }).length;
    const aviso = (branco ? `Você deixou ${branco} questão(ões) sem resposta. ` : "") +
      (at.tempo_limite_min ? "Depois de enviar, não será possível alterar. " : "");
    Alert.alert("Enviar respostas", `${aviso}Enviar mesmo assim?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Enviar", onPress: () => enviar(false) },
    ]);
  }

  async function iniciar() {
    setBusy(true); setMsg(null);
    try { await api.iniciarAtividade(at.id); await recarregar(); }
    catch (e) { setMsg({ t: "erro", m: e.message }); }
    finally { setBusy(false); }
  }

  if (estado === "tempo_esgotado") {
    return (<><Title sub={at.disciplina}>{at.titulo}</Title><Card><Text style={s.aviso}>O tempo desta atividade acabou e as respostas não foram enviadas. Fale com o seu professor.</Text></Card></>);
  }

  if (estado === "nao_iniciada") {
    return (
      <>
        <Title sub={at.disciplina}>{at.titulo}</Title>
        <Card>
          <Text style={s.h}>Antes de começar</Text>
          <Text style={s.p}>• {at.total_questoes ?? (d.questoes || []).length} questões, vale {pts(at.valor_maximo)} pontos.</Text>
          <Text style={s.p}>• Você terá {at.tempo_limite_min} minutos para responder.</Text>
          <Text style={s.p}>• O tempo começa ao tocar em Iniciar e não pausa.</Text>
          <Text style={s.p}>• Só dá para enviar uma vez; ao acabar o tempo, o que estiver respondido é enviado.</Text>
          <Message type={msg?.t} text={msg?.m} />
          <View style={{ height: 10 }} />
          <Button label="Iniciar agora" variant="cta" onPress={iniciar} loading={busy} />
        </Card>
      </>
    );
  }

  const corrigida = estado === "corrigida";
  return (
    <>
      <Title sub={`${at.disciplina} · vale ${pts(at.valor_maximo)} pts`}>{at.titulo}</Title>
      {estado === "em_andamento" && resta != null && (
        <View style={[s.timer, resta <= 60 && { backgroundColor: COLORS.error }]}>
          <Text style={s.timerL}>Tempo restante</Text>
          <Text style={s.timerV}>{relogio(resta)}</Text>
        </View>
      )}
      {estado === "enviada" && (
        <Card style={{ backgroundColor: COLORS.successBg }}>
          <Text style={s.p}>Respostas enviadas. {at.tempo_limite_min ? "Aguarde a correção do professor." : "Você pode atualizá-las até o professor corrigir."}</Text>
        </Card>
      )}

      {(d.questoes || []).map((q) => {
        const r = respostas[q.id] || {};
        const marcada = corrigida ? q.alternativa : r.alternativa;
        return (
          <Card key={q.id}>
            <View style={s.qTop}>
              <Text style={s.h}>Questão {q.ordem}</Text>
              <Badge label={corrigida && q.pontos_obtidos != null ? `${pts(q.pontos_obtidos)} / ${pts(q.pontos)} pts` : `vale ${pts(q.pontos)}`} />
            </View>
            <Text style={s.p}>{q.enunciado}</Text>
            {q.tipo === "objetiva" ? (
              (q.alternativas || []).map((txt, i) => {
                const certa = corrigida && q.correta === i;
                const errada = corrigida && marcada === i && q.correta !== i;
                return (
                  <Pressable
                    key={i}
                    disabled={!editavel}
                    onPress={() => setRespostas((m) => ({ ...m, [q.id]: { ...m[q.id], alternativa: i } }))}
                    style={[s.alt, marcada === i && s.altOn, certa && s.altCerta, errada && s.altErrada]}
                  >
                    <Text style={s.letra}>{LETRAS[i]})</Text>
                    <Text style={[s.p, { flex: 1 }]}>{txt}</Text>
                  </Pressable>
                );
              })
            ) : (
              <TextInput
                style={s.area}
                multiline
                editable={editavel}
                value={corrigida ? q.resposta || "" : r.resposta || ""}
                onChangeText={(v) => setRespostas((m) => ({ ...m, [q.id]: { ...m[q.id], resposta: v } }))}
                placeholder="Escreva aqui a sua resposta…"
                placeholderTextColor={COLORS.placeholder}
              />
            )}
            {corrigida && q.comentario ? <Text style={s.coment}>Comentário do professor: {q.comentario}</Text> : null}
          </Card>
        );
      })}

      <Message type={msg?.t} text={msg?.m} />
      {editavel && (
        <>
          <View style={{ height: 8 }} />
          <Button label={estado === "enviada" ? "Atualizar respostas" : "Enviar respostas"} onPress={confirmarEnvio} loading={busy} />
        </>
      )}
    </>
  );
}

const useS = makeStyles(() => ({
  p: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 20, marginTop: 4 },
  h: { fontFamily: FONTS.bodyExtraBold, fontSize: 15, color: COLORS.text },
  nota: { fontFamily: FONTS.bodyExtraBold, fontSize: 18, color: COLORS.successText },
  aviso: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.error, marginTop: 8 },
  area: { minHeight: 110, borderWidth: 1, borderColor: COLORS.borderInput, borderRadius: 8, padding: 10, marginTop: 8, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, textAlignVertical: "top", backgroundColor: COLORS.card },
  timer: { backgroundColor: COLORS.navy, borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  timerL: { fontFamily: FONTS.bodyBold, fontSize: 13, color: "#dfe7f6" },
  timerV: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.white },
  qTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  alt: { flexDirection: "row", gap: 8, alignItems: "flex-start", borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 8 },
  altOn: { borderColor: COLORS.navy, backgroundColor: "#eaf1ff" },
  altCerta: { borderColor: COLORS.success, backgroundColor: COLORS.successBg },
  altErrada: { borderColor: COLORS.error, backgroundColor: COLORS.errorBg },
  letra: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text, marginTop: 4 },
  coment: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.text, fontStyle: "italic", marginTop: 8 },
}));