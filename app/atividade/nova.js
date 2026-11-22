import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { api } from "../../src/api";
import Button from "../../src/components/Button";
import Message from "../../src/components/Message";
import TextField from "../../src/components/TextField";
import { COLORS, FONTS } from "../../src/theme";
import { dataBRparaISO, mascaraData, num } from "../../src/format";
import Page, { Card, SoPara, Title } from "../../src/ui/page";
import { useApi } from "../../src/api";
import { makeStyles } from "../../src/ui/estilos";

const MIN_ALTERNATIVAS = 2;
const MAX_ALTERNATIVAS = 6;
const MAX_TEMPO_MIN = 600;
const LETRAS = "ABCDEF";
const novaQuestao = (tipo) => ({
  tipo,
  enunciado: "",
  pontos: "1",
  alternativas: ["", "", "", ""],
  correta: null, // o educador precisa marcar a correta (como no Web)
});

export default function NovaAtividadeTela() {
  return (
    <SoPara tipo="educador">
      <NovaAtividade />
    </SoPara>
  );
}

function NovaAtividade() {
  const styles = useStyles();
  const { tipo: tipoParam, turmaId: turmaParam } = useLocalSearchParams();
  const tipo = tipoParam === "avaliacao" ? "avaliacao" : "atividade";
  const rotulo = tipo === "avaliacao" ? "avaliação" : "atividade";
  const router = useRouter();
  const turmasApi = useApi(() => api.turmas(), []);
  const turmas = turmasApi.data?.turmas || [];

  const [titulo, setTitulo] = useState("");
  const [turmaId, setTurmaId] = useState(turmaParam ? Number(turmaParam) : null);
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("10");
  const [usaTempo, setUsaTempo] = useState(false);
  const [tempo, setTempo] = useState("30");
  const [questoes, setQuestoes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const temQuestoes = questoes.length > 0;
  const soma = questoes.reduce((s, q) => s + (num(q.pontos) || 0), 0);

  const setQ = (i, patch) => setQuestoes((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const setAlt = (i, k, v) =>
    setQuestoes((qs) => qs.map((q, j) => (j === i ? { ...q, alternativas: q.alternativas.map((a, m) => (m === k ? v : a)) } : q)));

  const addAlt = (i) =>
    setQuestoes((qs) => qs.map((q, j) => (j === i && q.alternativas.length < MAX_ALTERNATIVAS ? { ...q, alternativas: [...q.alternativas, ""] } : q)));
  const delAlt = (i, k) =>
    setQuestoes((qs) =>
      qs.map((q, j) => {
        if (j !== i || q.alternativas.length <= MIN_ALTERNATIVAS) return q;
        let correta = q.correta;
        if (correta === k) correta = null;
        else if (correta !== null && correta > k) correta -= 1;
        return { ...q, correta, alternativas: q.alternativas.filter((_, m) => m !== k) };
      }),
    );

  function validar() {
    if (!turmaId) return "Selecione a turma em que o conteúdo será publicado.";
    if (!titulo.trim() || !data.trim() || !descricao.trim()) return "Preencha título, data e descrição.";
    if (!dataBRparaISO(data)) return "Informe uma data válida no formato DD/MM/AAAA (ex.: 05/12/2026).";
    if (!temQuestoes && !(num(valor) > 0)) return "Informe um valor/pontuação maior que zero.";
    if (usaTempo && !(Number.isInteger(num(tempo)) && num(tempo) >= 1 && num(tempo) <= MAX_TEMPO_MIN))
      return `O tempo limite deve ser um número inteiro de minutos entre 1 e ${MAX_TEMPO_MIN}.`;
    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      const n = `Questão ${i + 1}: `;
      if (!q.enunciado.trim()) return n + "escreva o enunciado.";
      if (!(num(q.pontos) > 0)) return n + "informe os pontos.";
      if (q.tipo === "objetiva" && q.alternativas.some((a) => !a.trim())) return n + "preencha todas as alternativas.";
      if (q.tipo === "objetiva" && (q.correta === null || q.correta < 0 || q.correta >= q.alternativas.length)) return n + "marque qual alternativa é a correta.";
    }
    return null;
  }

  async function publicar() {
    const problema = validar();
    if (problema) return setMsg({ t: "erro", m: problema });
    setBusy(true);
    setMsg(null);
    try {
      const resp = await api.criarAtividade({
        titulo: titulo.trim(),
        turma_id: turmaId,
        data_aplicacao: dataBRparaISO(data),
        valor_maximo: temQuestoes ? soma : num(valor),
        descricao: descricao.trim(),
        tipo,
        tempo_limite_min: usaTempo ? num(tempo) : null,
        questoes: questoes.map((q) => {
          const base = { tipo: q.tipo, enunciado: q.enunciado.trim(), pontos: num(q.pontos) };
          if (q.tipo === "objetiva") {
            base.alternativas = q.alternativas.map((a) => a.trim());
            base.correta = q.correta;
          }
          return base;
        }),
      });
      const aviso =
        temQuestoes && resp.total_questoes == null
          ? " O servidor não confirmou o salvamento das questões — confira no site."
          : "";
      setMsg({ t: aviso ? "erro" : "sucesso", m: `Sua ${rotulo} foi publicada para a turma.${aviso}` });
      setTitulo(""); setDescricao(""); setQuestoes([]);
      setTimeout(() => router.back(), aviso ? 2500 : 900);
    } catch (e) {
      setMsg({ t: "erro", m: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `Nova ${rotulo}` }} />
      <Page loading={turmasApi.loading} error={turmasApi.error}>
        <Title sub="Será publicada para todos os alunos da turma">Nova {rotulo}</Title>

        <Card>
          <Text style={styles.label}>Turma</Text>
          {turmas.length === 0 ? (
            <Text style={styles.vazio}>Crie uma turma antes de publicar.</Text>
          ) : (
            <View style={styles.chips}>
              {turmas.map((t) => (
                <Pressable key={t.id} onPress={() => setTurmaId(t.id)} style={[styles.chip, turmaId === t.id && styles.chipOn]}>
                  <Text style={[styles.chipT, turmaId === t.id && { color: COLORS.white }]}>{t.nome}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <TextField label="Título" value={titulo} onChangeText={setTitulo} />
          <TextField label="Prazo / data de aplicação" value={data} onChangeText={(v) => setData(mascaraData(v))} placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} />
          <TextField label="Descrição" value={descricao} onChangeText={setDescricao} multiline />
          {!temQuestoes && (
            <TextField label="Valor máximo" value={valor} onChangeText={setValor} keyboardType="decimal-pad" />
          )}
          <View style={styles.switchRow}>
            <Text style={styles.label}>Tempo limite</Text>
            <Switch value={usaTempo} onValueChange={setUsaTempo} trackColor={{ true: COLORS.orange }} />
          </View>
          {usaTempo && <TextField label="Minutos" value={tempo} onChangeText={setTempo} keyboardType="number-pad" />}
        </Card>

        <Text style={styles.secao}>Questões {temQuestoes ? `· total ${soma} pts` : "(opcional)"}</Text>
        {questoes.map((q, i) => (
          <Card key={i}>
            <View style={styles.qHead}>
              <Text style={styles.qT}>Questão {i + 1} · {q.tipo === "objetiva" ? "Objetiva" : "Discursiva"}</Text>
              <Pressable onPress={() => setQuestoes((qs) => qs.filter((_, j) => j !== i))}>
                <Text style={styles.rem}>Remover</Text>
              </Pressable>
            </View>
            <TextField label="Enunciado" value={q.enunciado} onChangeText={(v) => setQ(i, { enunciado: v })} multiline />
            <TextField label="Pontos" value={q.pontos} onChangeText={(v) => setQ(i, { pontos: v })} keyboardType="decimal-pad" />
            {q.tipo === "objetiva" && (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Alternativas (toque na letra da correta)</Text>
                {q.alternativas.map((a, k) => (
                  <View key={k} style={styles.altRow}>
                    <Pressable onPress={() => setQ(i, { correta: k })} style={[styles.letra, q.correta === k && styles.letraOn]}>
                      <Text style={[styles.letraT, q.correta === k && { color: COLORS.white }]}>{LETRAS[k]}</Text>
                    </Pressable>
                    <TextField style={{ flex: 1 }} value={a} onChangeText={(v) => setAlt(i, k, v)} placeholder={`Alternativa ${LETRAS[k]}`} />
                    {q.alternativas.length > MIN_ALTERNATIVAS ? (
                      <Pressable onPress={() => delAlt(i, k)} accessibilityRole="button" accessibilityLabel={`Remover alternativa ${LETRAS[k]}`} hitSlop={8}>
                        <Text style={styles.rem}>✕</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
                {q.alternativas.length < MAX_ALTERNATIVAS ? (
                  <Button label="+ Alternativa" variant="solid" onPress={() => addAlt(i)} />
                ) : null}
              </>
            )}
          </Card>
        ))}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label="+ Objetiva" variant="solid" onPress={() => setQuestoes([...questoes, novaQuestao("objetiva")])} style={{ flex: 1 }} />
          <Button label="+ Discursiva" variant="solid" onPress={() => setQuestoes([...questoes, novaQuestao("discursiva")])} style={{ flex: 1 }} />
        </View>

        <View style={{ height: 16 }} />
        <Message type={msg?.t} text={msg?.m} />
        <View style={{ height: 8 }} />
        <Button label={`Publicar ${rotulo}`} variant="cta" onPress={publicar} loading={busy} />
      </Page>
    </>
  );
}

const useStyles = makeStyles(() => ({
  label: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text },
  vazio: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted2, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.chip },
  chipOn: { backgroundColor: COLORS.navy },
  chipT: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  secao: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text, marginVertical: 8 },
  qHead: { flexDirection: "row", justifyContent: "space-between" },
  qT: { fontFamily: FONTS.bodyExtraBold, fontSize: 14, color: COLORS.text },
  rem: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.error },
  altRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  letra: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.chip, alignItems: "center", justifyContent: "center", marginTop: 12 },
  letraOn: { backgroundColor: COLORS.success },
  letraT: { fontFamily: FONTS.bodyBold, color: COLORS.text },
}));