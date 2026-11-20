import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import Message from "../src/components/Message";
import TextField from "../src/components/TextField";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, Empty, Title } from "../src/ui/page";
import { useApi } from "../src/api";

export default function Turmas() {
  const { usuario } = useAuth();
  const router = useRouter();
  const isEducador = usuario.tipo === "educador";
  const { data, loading, error, reload } = useApi(() => api.turmas(), []);

  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function enviar() {
    setBusy(true);
    setMsg(null);
    try {
      if (isEducador) {
        await api.criarTurma({ nome, disciplina });
        setNome("");
        setDisciplina("");
      } else {
        await api.entrarTurma(codigo);
        setCodigo("");
      }
      await reload();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  const turmas = data?.turmas || [];

  return (
    <Page loading={loading} error={error} onRefresh={reload}>
      <Title sub={isEducador ? "Crie e gerencie suas turmas" : "Entre com o código do professor"}>Turmas</Title>

      <Card>
        {isEducador ? (
          <>
            <TextField label="Nome da turma" value={nome} onChangeText={setNome} />
            <TextField label="Disciplina" value={disciplina} onChangeText={setDisciplina} />
          </>
        ) : (
          <TextField label="Código da turma" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" />
        )}
        {msg ? <Message type="erro" text={msg} /> : null}
        <Button label={isEducador ? "Criar turma" : "Entrar na turma"} onPress={enviar} loading={busy} />
      </Card>

      {turmas.length === 0 ? (
        <Empty text={isEducador ? "Você ainda não criou nenhuma turma." : "Você ainda não está em nenhuma turma."} />
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
              {isEducador && t.codigo ? <Text style={styles.codigo}>Código: {t.codigo}</Text> : null}
            </Card>
          </Pressable>
        ))
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  nome: { fontFamily: FONTS.bodyExtraBold, fontSize: 17, color: COLORS.navy },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  foot: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  codigo: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange, marginTop: 8 },
});