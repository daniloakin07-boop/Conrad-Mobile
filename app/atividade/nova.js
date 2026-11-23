// ============================================================================
// app/atividade/nova.js — PUBLICAR atividade ou avaliação (somente educador)
// Equivale a pages/nova-atividade.html e nova-avaliacao.html + JS/construtor-atividade.js
// e JS/seletor-turma.js do Web.
// Parâmetros de rota (opcionais): tipo = "atividade" | "avaliacao" e turmaId (pré-seleciona a turma).
// Envia para POST /api/atividades: { titulo, turma_id, data_aplicacao, valor_maximo, descricao, tipo }.
// O servidor confere se a turma pertence ao professor, valida o valor (0 < valor ≤ 1000) e
// publica a atividade já como avaliativa/aplicada (entra no boletim).
//
// IMPORTANTE — questões e tempo limite: o formulário Web tem um construtor de questões e
// de tempo limite, mas o servidor atual (JS/atividades.js) IGNORA esses campos (veja a
// seção "Limitações" da documentação). Por isso o Mobile não os oferece: não adianta
// montar questões que o servidor descartaria. O aluno responde com texto livre.
// ============================================================================
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { api, useApi } from "../../src/api";
import Button from "../../src/components/Button";
import Message from "../../src/components/Message";
import TextField from "../../src/components/TextField";
import { dataBRparaISO, mascaraData, num } from "../../src/format";
import { COLORS, FONTS } from "../../src/theme";
import { makeStyles } from "../../src/ui/estilos";
import Page, { Card, SoPara, Title } from "../../src/ui/page";

// Protege a tela: só educadores (o servidor também valida com o middleware soEducador).
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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // Validações do formulário Web (o servidor valida de novo).
  // @returns {string|null} mensagem do primeiro problema encontrado, ou null se está tudo certo.
  function validar() {
    if (!turmaId) return "Selecione a turma em que o conteúdo será publicado.";
    if (!titulo.trim() || !data.trim() || !descricao.trim()) return "Preencha título, data e descrição.";
    if (!dataBRparaISO(data)) return "Informe uma data válida no formato DD/MM/AAAA (ex.: 05/12/2026).";
    if (!(num(valor) > 0) || num(valor) > 1000) return "Informe um valor maior que zero e de até 1000.";
    return null;
  }

  // Publica a atividade e volta para a tela anterior.
  async function publicar() {
    const problema = validar();
    if (problema) return setMsg({ t: "erro", m: problema });
    setBusy(true);
    setMsg(null);
    try {
      await api.criarAtividade({
        titulo: titulo.trim(),
        turma_id: turmaId,
        data_aplicacao: dataBRparaISO(data),
        valor_maximo: num(valor),
        descricao: descricao.trim(),
        tipo,
      });
      setMsg({ t: "sucesso", m: `Sua ${rotulo} foi publicada para a turma.` });
      setTitulo("");
      setDescricao("");
      setTimeout(() => router.back(), 900);
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
            <Text style={styles.vazio}>Crie uma turma (aba Turmas) antes de publicar.</Text>
          ) : (
            <View style={styles.chips}>
              {turmas.map((t) => (
                <Pressable key={t.id} onPress={() => setTurmaId(t.id)} style={[styles.chip, turmaId === t.id && styles.chipOn]}>
                  <Text style={[styles.chipT, turmaId === t.id && { color: COLORS.white }]}>{t.nome}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <TextField label={`Título da ${rotulo}`} value={titulo} onChangeText={setTitulo} placeholder="Ex: Lista de exercícios sobre frações" />
          <TextField
            label="Data de entrega"
            value={data}
            onChangeText={(v) => setData(mascaraData(v))}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            maxLength={10}
          />
          <TextField label="Valor" value={valor} onChangeText={setValor} keyboardType="decimal-pad" />
          <TextField
            label="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            placeholder="Descreva a atividade, objetivos e instruções..."
          />
        </Card>

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
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: COLORS.chip, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: COLORS.navy },
  chipT: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text },
}));
