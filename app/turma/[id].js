import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { api, useApi } from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import Button from "../../src/components/Button";
import { dataBR, ehEducador, pts } from "../../src/format";
import { COLORS, FONTS } from "../../src/theme";
import Page, { Badge, Card, Empty, Segmented, Title } from "../../src/ui/page";

// Detalhe da turma: mesmas abas do Web (Pessoas, Atividades, Avaliações) + sala de vídeo.
export default function TurmaDetalhe() {
  const { id } = useLocalSearchParams();
  const { usuario } = useAuth();
  const router = useRouter();
  const educador = ehEducador(usuario);
  const { data, loading, error, reload } = useApi(() => api.turma(id), [id]);
  const [aba, setAba] = useState("pessoas");
  const turma = data?.turma;

  function remover(p) {
    Alert.alert("Remover aluno", `Retirar ${p.nome} desta turma?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await api.removerAluno(id, p.id);
            reload();
          } catch (e) {
            Alert.alert("Não foi possível remover", e.message);
          }
        },
      },
    ]);
  }

  function conversar(p) {
    router.push({ pathname: "/conversa", params: { turmaId: String(id), participanteId: String(p.id), nome: p.nome } });
  }

  return (
    <>
      <Stack.Screen options={{ title: turma?.nome || "Turma" }} />
      <Page loading={loading && !data} error={error && !data ? error : ""} onRefresh={reload}>
        {turma && (
          <>
            <Title sub={`${turma.disciplina}${turma.secao ? ` · ${turma.secao}` : ""} · Prof. ${turma.professor}`}>{turma.nome}</Title>

            {turma.descricao ? (
              <Card><Text style={styles.desc}>{turma.descricao}</Text></Card>
            ) : null}

            {educador && turma.codigo ? (
              <Card>
                <Text style={styles.meta}>Código de entrada</Text>
                <Text style={styles.codigo}>{turma.codigo}</Text>
                <Pressable onPress={() => Share.share({ message: `Entre na minha turma no CONRAD com o código ${turma.codigo}` })} style={styles.linkBtn}>
                  <Ionicons name="share-outline" size={16} color={COLORS.orange} />
                  <Text style={styles.link}>Compartilhar código</Text>
                </Pressable>
              </Card>
            ) : null}

            {turma.video_room ? (
              <View style={{ marginBottom: 12 }}>
                <Button
                  label="Entrar na sala de vídeo"
                  variant="cta"
                  onPress={() => Linking.openURL(`https://meet.jit.si/${encodeURIComponent(turma.video_room)}`)}
                />
              </View>
            ) : null}

            <Segmented
              options={[["pessoas", "Pessoas"], ["atividade", "Atividades"], ["avaliacao", "Avaliações"]]}
              value={aba}
              onChange={setAba}
            />

            {aba === "pessoas" ? (
              <Card>
                <Text style={styles.cardTitle}>Pessoas ({data.pessoas.length})</Text>
                {data.pessoas.map((p) => {
                  const ehProfessor = p.papel === "Professor";
                  const souEu = Number(p.id) === Number(usuario.id);
                  // O chat existe só entre o professor da turma e cada aluno.
                  const podeConversar = !souEu && (educador ? !ehProfessor : ehProfessor);
                  return (
                    <View key={`${p.papel}-${p.id}`} style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nome}>{p.nome}{souEu ? " (você)" : ""}</Text>
                        <Badge label={p.papel} bg={ehProfessor ? "#fde8d3" : COLORS.chip} />
                      </View>
                      {podeConversar && (
                        <Pressable onPress={() => conversar(p)} hitSlop={10} style={styles.icone} accessibilityLabel={`Conversar com ${p.nome}`}>
                          <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.navy} />
                        </Pressable>
                      )}
                      {educador && !ehProfessor && (
                        <Pressable onPress={() => remover(p)} hitSlop={10} style={styles.icone} accessibilityLabel={`Remover ${p.nome}`}>
                          <Ionicons name="person-remove-outline" size={22} color={COLORS.error} />
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </Card>
            ) : (
              <ConteudosDaTurma key={aba} tipo={aba} turmaId={id} educador={educador} router={router} />
            )}
          </>
        )}
      </Page>
    </>
  );
}

function ConteudosDaTurma({ tipo, turmaId, educador, router }) {
  const { data, loading, error } = useApi(async () => {
    const r = educador
      ? await api.atividadesEducador({ turmaId, tipo })
      : await api.atividadesAluno({ turmaId, tipo });
    return Array.isArray(r) ? r : r.atividades || [];
  }, [tipo, turmaId]);

  if (loading) return <Empty text="Carregando…" />;
  if (error) return <Empty text={error} />;
  const itens = data || [];
  const rotulo = tipo === "avaliacao" ? "avaliação" : "atividade";

  return (
    <>
      {educador && (
        <View style={{ marginBottom: 12 }}>
          <Button
            label={`+ Criar ${rotulo}`}
            variant="solid"
            onPress={() => router.push({ pathname: "/atividade/nova", params: { tipo, turmaId: String(turmaId) } })}
          />
        </View>
      )}
      {itens.length === 0 ? (
        <Empty text={`Nenhuma ${rotulo} foi publicada nesta turma ainda.`} />
      ) : (
        itens.map((a) => {
          const status = educador
            ? `${a.total_entregas || 0} entrega(s)`
            : a.corrigida_em ? `Nota: ${pts(a.nota)} / ${pts(a.valor_maximo)}` : a.enviada_em ? "Enviada" : "Pendente";
          return (
            <Pressable key={a.id} onPress={() => router.push(educador ? `/atividade/${a.id}/entregas` : `/atividade/${a.id}`)}>
              <Card>
                <Text style={styles.nome}>{a.titulo}</Text>
                <Text style={styles.meta}>{a.disciplina} · Prazo: {dataBR(a.data_aplicacao)} · {pts(a.valor_maximo)} pts</Text>
                <Text style={[styles.meta, { color: COLORS.navy, fontFamily: FONTS.bodyBold }]}>{status}</Text>
              </Card>
            </Pressable>
          );
        })
      )}
    </>
  );
}

const styles = StyleSheet.create({
  desc: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.navy, lineHeight: 20 },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  codigo: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.orange, letterSpacing: 2 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, minHeight: 36 },
  link: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange },
  cardTitle: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.navy, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.hairline },
  nome: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.navy, marginBottom: 2 },
  icone: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
});
