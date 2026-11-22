import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { api, useApi } from "../src/api";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import Message from "../src/components/Message";
import TextField from "../src/components/TextField";
import { ehEducador } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, Empty, Title } from "../src/ui/page";
import { makeStyles } from "../src/ui/estilos";

export default function Turmas() {
  const styles = useStyles();
  const { usuario } = useAuth();
  const router = useRouter();
  const educador = ehEducador(usuario);
  const { data, loading, error, reload } = useApi(() => api.turmas(), []);

  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [secao, setSecao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [aberto, setAberto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useFocusEffect(
    useCallback(() => {
      reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  async function enviar() {
    setMsg(null);
    // Mesmas validações do formulário Web (o servidor valida de novo).
    if (educador && (!nome.trim() || !disciplina.trim())) return setMsg({ t: "erro", m: "Informe o nome e a disciplina da turma." });
    if (!educador && !codigo.trim()) return setMsg({ t: "erro", m: "Digite o código da turma." });

    setBusy(true);
    try {
      if (educador) {
        const r = await api.criarTurma({ nome: nome.trim(), disciplina: disciplina.trim(), secao: secao.trim(), descricao: descricao.trim() });
        setNome(""); setDisciplina(""); setSecao(""); setDescricao(""); setAberto(false);
        Alert.alert("Turma criada!", `Código de entrada: ${r.codigo}`, [
          { text: "Compartilhar código", onPress: () => Share.share({ message: `Entre na minha turma no CONRAD com o código ${r.codigo}` }) },
          { text: "OK" },
        ]);
      } else {
        const r = await api.entrarTurma(codigo);
        setCodigo(""); setAberto(false);
        Alert.alert("Pronto!", `Você entrou na turma ${r.turma?.nome || ""}.`);
      }
      await reload();
    } catch (e) {
      setMsg({ t: "erro", m: e.message });
    } finally {
      setBusy(false);
    }
  }

  const turmas = data?.turmas || [];

  return (
    <Page loading={loading && !data} error={error && !data ? error : ""} onRefresh={reload}>
      <Title sub={educador ? "Crie e gerencie suas turmas" : "Entre com o código do professor"}>Turmas</Title>

      <Button
        label={aberto ? "Cancelar" : educador ? "+ Criar turma" : "+ Entrar com código"}
        variant={aberto ? "solid" : "cta"}
        onPress={() => { setAberto(!aberto); setMsg(null); }}
      />

      {aberto && (
        <Card style={{ marginTop: 12 }}>
          {educador ? (
            <>
              <TextField label="Nome da turma" value={nome} onChangeText={setNome} maxLength={120} />
              <TextField label="Disciplina" value={disciplina} onChangeText={setDisciplina} maxLength={120} />
              <TextField label="Seção (opcional)" value={secao} onChangeText={setSecao} maxLength={80} />
              <TextField label="Descrição (opcional)" value={descricao} onChangeText={setDescricao} multiline maxLength={1000} />
            </>
          ) : (
            <TextField label="Código da turma" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" autoCorrect={false} maxLength={12} />
          )}
          <Message type={msg?.t} text={msg?.m} />
          <View style={{ height: 12 }} />
          <Button label={educador ? "Criar turma" : "Entrar na turma"} onPress={enviar} loading={busy} />
        </Card>
      )}

      <View style={{ height: 12 }} />
      {turmas.length === 0 ? (
        <Empty text={educador ? "Você ainda não criou nenhuma turma." : "Você ainda não está em nenhuma turma."} />
      ) : (
        turmas.map((t) => (
          <Pressable key={t.id} onPress={() => router.push(`/turma/${t.id}`)}>
            <Card>
              <Text style={styles.nome}>{t.nome}</Text>
              <Text style={styles.meta}>{t.disciplina}{t.secao ? ` · ${t.secao}` : ""}</Text>
              <View style={styles.foot}>
                <Text style={styles.meta}>Prof. {t.professor}</Text>
                <Text style={styles.meta}>{t.quantidade_alunos} aluno(s)</Text>
              </View>
              {educador && t.codigo ? <Text style={styles.codigo}>Código: {t.codigo}</Text> : null}
            </Card>
          </Pressable>
        ))
      )}
    </Page>
  );
}

const useStyles = makeStyles(() => ({
  nome: { fontFamily: FONTS.bodyExtraBold, fontSize: 17, color: COLORS.text },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  foot: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  codigo: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange, marginTop: 8 },
}));
