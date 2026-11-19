import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { api } from "../../src/api";
import Button from "../../src/components/Button";
import Message from "../../src/components/Message";
import TextField from "../../src/components/TextField";
import { COLORS, FONTS } from "../../src/theme";
import Page, { Card, Title } from "../../src/ui/Page";
import { useApi } from "../../src/ui/useApi";

const LETRAS = "ABCDEF";
const novaQuestao = (tipo) => ({
  tipo,
  enunciado: "",
  pontos: "1",
  alternativas: ["", "", "", ""],
  correta: 0,
});
const num = (v) => Number(String(v).replace(",", "."));

export default function NovaAtividade() {
  const { tipo: tipoParam } = useLocalSearchParams();
  const tipo = tipoParam === "avaliacao" ? "avaliacao" : "atividade";
  const rotulo = tipo === "avaliacao" ? "avaliação" : "atividade";
  const router = useRouter();
  const turmasApi = useApi(() => api.turmas(), []);
  const turmas = turmasApi.data?.turmas || [];

  const [titulo, setTitulo] = useState("");
  const [turmaId, setTurmaId] = useState(null);
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

  function validar() {
    if (!turmaId) return "Selecione a turma em que o conteúdo será publicado.";
    if (!titulo.trim() || !data.trim() || !descricao.trim()) return "Preencha título, data e descrição.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.trim())) return "Use a data no formato AAAA-MM-DD (ex.: 2026-12-05).";
    if (!temQuestoes && !(num(valor) > 0)) return "Informe um valor/pontuação maior que zero.";
    if (usaTempo && !(Number.isInteger(num(tempo)) && num(tempo) > 0)) return "Informe o tempo limite em minutos.";
    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      const n = `Questão ${i + 1}: `;
      if (!q.enunciado.trim()) return n + "escreva o enunciado.";
      if (!(num(q.pontos) > 0)) return n + "informe os pontos.";
      if (q.tipo === "objetiva" && q.alternativas.some((a) => !a.trim())) return n + "preencha todas as alternativas.";
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
        data_aplicacao: data.trim(),
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
          <TextField label="Data de aplicação (AAAA-MM-DD)" value={data} onChangeText={setData} placeholder="2026-12-05" keyboardType="numbers-and-punctuation" />
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
                  </View>
                ))}
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

const styles = StyleSheet.create({
  label: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text },
  vazio: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted2, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#e6ecf5" },
  chipOn: { backgroundColor: COLORS.navy },
  chipT: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.navy },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  secao: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.navy, marginVertical: 8 },
  qHead: { flexDirection: "row", justifyContent: "space-between" },
  qT: { fontFamily: FONTS.bodyExtraBold, fontSize: 14, color: COLORS.navy },
  rem: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.error },
  altRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  letra: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#e6ecf5", alignItems: "center", justifyContent: "center", marginTop: 12 },
  letraOn: { backgroundColor: COLORS.success },
  letraT: { fontFamily: FONTS.bodyBold, color: COLORS.navy },
});