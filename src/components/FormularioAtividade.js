// ============================================================================
// src/components/FormularioAtividade.js — formulário de atividade/avaliação (Mobile)
// Compartilhado por:
//   • app/atividade/nova.js         → PUBLICAR (modo "nova": campos vazios);
//   • app/atividade/[id]/editar.js  → EDITAR  (modo "editar": campos já preenchidos).
// Assim as duas telas têm a mesma aparência e as mesmas validações (sem duplicar código).
// Equivale ao formulário de pages/nova-atividade.html (JS/construtor-atividade.js) no Web.
//
// Props:
//   modo            "nova" | "editar"
//   tipo            "atividade" | "avaliacao" (valor inicial/fixo na criação)
//   turmas          turmas do educador (GET /api/turmas)
//   inicial         { titulo, turmaId, data (DD/MM/AAAA), valor, descricao } — usado ao montar
//   turmaBloqueada  true impede trocar a turma (atividade com entregas/notas)
//   tipoBloqueado   true impede trocar o tipo (atividade com entregas)
//   rotuloBotao     texto do botão principal
//   msgSucesso      mensagem exibida após salvar
//   limparAoSalvar  true (criação) limpa título e descrição depois de salvar
//   onSalvar        async (payload) => … ; deve LANÇAR Error se o servidor recusar
//   aoConcluir      chamada ~0,9 s depois do sucesso (normalmente volta para a tela anterior)
// ============================================================================
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { dataBRparaISO, mascaraData, num } from "../format";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";
import { Card, Segmented } from "../ui/page";
import Button from "./Button";
import Message from "./Message";
import TextField from "./TextField";

export default function FormularioAtividade({
  modo = "nova",
  tipo: tipoInicial = "atividade",
  turmas = [],
  inicial = {},
  turmaBloqueada = false,
  tipoBloqueado = false,
  rotuloBotao = "Salvar",
  msgSucesso = "Salvo com sucesso.",
  limparAoSalvar = false,
  onSalvar,
  aoConcluir,
}) {
  const styles = useStyles();
  const editando = modo === "editar";
  const [titulo, setTitulo] = useState(inicial.titulo ?? "");
  const [turmaId, setTurmaId] = useState(inicial.turmaId ?? null);
  const [data, setData] = useState(inicial.data ?? "");
  const [descricao, setDescricao] = useState(inicial.descricao ?? "");
  const [valor, setValor] = useState(inicial.valor ?? "10");
  const [tipo, setTipo] = useState(tipoInicial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  // Trava síncrona contra toques repetidos em "Salvar"
  const enviandoRef = useRef(false);

  const rotulo = tipo === "avaliacao" ? "avaliação" : "atividade";

  // Validações do formulário Web (o servidor valida de novo).
  // Na criação, título, data e descrição são obrigatórios; na edição só o título (conteúdos
  // antigos podem não ter data/descrição e não devem ficar impossíveis de editar).
  // @returns {string|null} mensagem do primeiro problema encontrado, ou null se está tudo certo.
  function validar() {
    if (!turmaId) return "Selecione a turma em que o conteúdo será publicado.";
    if (!titulo.trim()) return "Preencha o título.";
    if (!editando && (!data.trim() || !descricao.trim())) return "Preencha título, data e descrição.";
    if (data.trim() && !dataBRparaISO(data)) return "Informe uma data válida no formato DD/MM/AAAA (ex.: 05/12/2026).";
    if (!(num(valor) > 0) || num(valor) > 1000) return "Informe um valor maior que zero e de até 1000.";
    return null;
  }

  async function salvar() {
    if (enviandoRef.current) return;
    const problema = validar();
    if (problema) return setMsg({ t: "erro", m: problema });
    enviandoRef.current = true;
    setBusy(true);
    setMsg(null);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        turma_id: turmaId,
        data_aplicacao: data.trim() ? dataBRparaISO(data) : null,
        valor_maximo: num(valor),
        descricao: descricao.trim(),
        tipo,
      });
      setMsg({ t: "sucesso", m: msgSucesso });
      if (limparAoSalvar) {
        setTitulo("");
        setDescricao("");
      }
      if (aoConcluir) setTimeout(aoConcluir, 900);
    } catch (e) {
      setMsg({ t: "erro", m: e.message });
    } finally {
      enviandoRef.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <Card>
        {editando && (
          <>
            <Text style={styles.label}>Tipo</Text>
            {tipoBloqueado ? (
              <Text style={styles.dica}>
                {tipo === "avaliacao" ? "Avaliação" : "Atividade"} — o tipo não pode mudar porque já existem entregas.
              </Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                <Segmented options={[["atividade", "Atividade"], ["avaliacao", "Avaliação"]]} value={tipo} onChange={setTipo} />
              </View>
            )}
          </>
        )}

        <Text style={styles.label}>Turma</Text>
        {turmas.length === 0 ? (
          <Text style={styles.vazio}>Crie uma turma (aba Turmas) antes de publicar.</Text>
        ) : (
          <View style={styles.chips}>
            {turmas.map((t) => (
              <Pressable
                key={t.id}
                disabled={turmaBloqueada}
                onPress={() => setTurmaId(t.id)}
                style={[styles.chip, turmaId === t.id && styles.chipOn, turmaBloqueada && { opacity: 0.6 }]}
              >
                <Text style={[styles.chipT, turmaId === t.id && { color: COLORS.white }]}>{t.nome}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {turmaBloqueada ? (
          <Text style={styles.dica}>A turma não pode mudar porque já existem entregas ou notas.</Text>
        ) : null}

        <TextField label={`Título da ${rotulo}`} value={titulo} onChangeText={setTitulo} placeholder="Ex: Lista de exercícios sobre frações" maxLength={160} />
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
      <Button label={rotuloBotao} variant="cta" onPress={salvar} loading={busy} />
    </>
  );
}

const useStyles = makeStyles(() => ({
  label: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text, marginTop: 4 },
  vazio: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted2, marginTop: 6 },
  dica: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: COLORS.chip, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: COLORS.navy },
  chipT: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text },
}));
