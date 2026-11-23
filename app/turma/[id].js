// ============================================================================
// app/turma/[id].js — SALA DA TURMA (rota dinâmica "/turma/123")
// Equivale a pages/turma.html + JS/turma-detalhes.js do Web, com as mesmas abas:
//   Mural (resumo e atalhos) · Atividades · Avaliações · Pessoas · Sala de vídeo.
// API usada: GET /api/turmas/:id (dados e pessoas), GET /api/atividades (educador) ou
// GET /api/aluno/atividades (aluno), DELETE /api/turmas/:id/alunos/:alunoId (remover aluno).
// Regras respeitadas: só o professor dono vê o código de entrada e remove alunos; o
// bate-papo existe apenas entre o professor da turma e cada aluno matriculado.
// A sala de vídeo é uma sala do Jitsi Meet (turma.video_room); o código do Conrad NÃO
// autentica pessoas dentro do Jitsi (aviso idêntico ao do Web).
// ============================================================================
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, Share, Text, View } from "react-native";
import { api, useApi } from "../../src/api";
import { useAuth } from "../../src/AuthContext";
import Button from "../../src/components/Button";
import { dataBR, ehEducador, pts } from "../../src/format";
import { COLORS, FONTS } from "../../src/theme";
import { makeStyles } from "../../src/ui/estilos";
import Page, { Badge, Card, Empty, Segmented, Title } from "../../src/ui/page";

// Abre a sala de vídeo da turma no Jitsi (app ou navegador do aparelho).
const abrirVideo = (sala) => Linking.openURL(`https://meet.jit.si/${encodeURIComponent(sala)}`);

export default function TurmaDetalhe() {
  const styles = useStyles();
  const { id } = useLocalSearchParams(); // parâmetro da rota dinâmica [id]
  const { usuario } = useAuth();
  const router = useRouter();
  const educador = ehEducador(usuario);
  const { data, loading, error, reload } = useApi(() => api.turma(id), [id]);
  const [aba, setAba] = useState("mural"); // o Web também abre no Mural
  const turma = data?.turma;

  // Confirma e remove um aluno da turma (somente educador; o servidor valida o dono).
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

  // Abre a conversa privada com a pessoa escolhida (tela /conversa).
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

            {/* Código de convite: o servidor só o envia ao professor dono da turma. */}
            {educador && turma.codigo ? (
              <Card>
                <Text style={styles.meta}>Código de entrada</Text>
                <Text style={styles.codigo}>{turma.codigo}</Text>
                <Pressable
                  onPress={() => Share.share({ message: `Entre na minha turma no CONRAD com o código ${turma.codigo}` })}
                  style={styles.linkBtn}
                  accessibilityRole="button"
                >
                  <Ionicons name="share-outline" size={16} color={COLORS.orange} />
                  <Text style={styles.link}>Compartilhar código</Text>
                </Pressable>
              </Card>
            ) : null}

            <Segmented
              options={[["mural", "Mural"], ["atividade", "Atividades"], ["avaliacao", "Avaliações"], ["pessoas", "Pessoas"], ["video", "Vídeo"]]}
              value={aba}
              onChange={setAba}
            />

            {aba === "mural" ? (
              <Mural turma={turma} educador={educador} irPara={setAba} />
            ) : aba === "pessoas" ? (
              <Card>
                <Text style={styles.cardTitle}>Pessoas ({data.pessoas.length})</Text>
                {data.pessoas.map((p) => {
                  const ehProfessor = p.papel === "Professor";
                  const souEu = Number(p.id) === Number(usuario.id);
                  // O chat existe só entre o professor da turma e cada aluno (regra de JS/chat.js).
                  const podeConversar = !souEu && (educador ? !ehProfessor : ehProfessor);
                  return (
                    <View key={`${p.papel}-${p.id}`} style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.nome}>{p.nome}{souEu ? " (você)" : ""}</Text>
                        <Badge label={p.papel} bg={ehProfessor ? "#fde8d3" : COLORS.chip} />
                      </View>
                      {podeConversar && (
                        <Pressable onPress={() => conversar(p)} hitSlop={10} style={styles.icone} accessibilityLabel={`Conversar com ${p.nome}`}>
                          <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.text} />
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
            ) : aba === "video" ? (
              <Card>
                <Text style={styles.cardTitle}>Sala de vídeo</Text>
                <Text style={styles.desc}>
                  A videoconferência é fornecida pelo Jitsi. O código de entrada do Conrad não autentica os participantes dentro do serviço externo; compartilhe o link apenas com pessoas da turma.
                </Text>
                <View style={{ height: 12 }} />
                {turma.video_room ? (
                  <Button label="Entrar na sala de vídeo" variant="cta" onPress={() => abrirVideo(turma.video_room)} />
                ) : (
                  <Empty text="Esta turma ainda não tem sala de vídeo." />
                )}
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

// Aba "Mural": descrição, contadores (alunos, atividades, avaliações) e atalhos.
// Os contadores vêm das mesmas rotas usadas nas abas de conteúdo.
function Mural({ turma, educador, irPara }) {
  const styles = useStyles();
  const { data, loading } = useApi(async () => {
    const buscar = async (tipo) => {
      const r = educador
        ? await api.atividadesEducador({ turmaId: turma.id, tipo })
        : await api.atividadesAluno({ turmaId: turma.id, tipo });
      return (Array.isArray(r) ? r : r.atividades || []).length;
    };
    const [atividades, avaliacoes] = await Promise.all([buscar("atividade"), buscar("avaliacao")]);
    return { atividades, avaliacoes };
  }, [turma.id]);

  const itens = [
    [turma.quantidade_alunos ?? 0, "Alunos matriculados"],
    [loading ? "–" : data?.atividades ?? 0, "Atividades publicadas"],
    [loading ? "–" : data?.avaliacoes ?? 0, "Avaliações publicadas"],
  ];

  return (
    <Card>
      <Text style={styles.cardTitle}>Bem-vindo à sua turma</Text>
      <Text style={styles.desc}>
        {turma.descricao || "Aqui ficam reunidos os conteúdos, as atividades e os encontros desta sala."}
      </Text>
      <View style={styles.resumo}>
        {itens.map(([valor, rotulo]) => (
          <View key={rotulo} style={styles.resumoItem}>
            <Text style={styles.resumoN}>{valor}</Text>
            <Text style={styles.resumoL}>{rotulo}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <Button label="Ver atividades" variant="solid" onPress={() => irPara("atividade")} />
        <Button label="Ver avaliações" variant="solid" onPress={() => irPara("avaliacao")} />
        <Button label="Entrar na sala de vídeo" variant="cta" onPress={() => irPara("video")} />
      </View>
    </Card>
  );
}

// Abas "Atividades" e "Avaliações": conteúdos da turma.
//  • educador: contagem de entregas (e botão para criar) → abre a correção;
//  • aluno: Pendente / Enviada / Nota → abre a atividade para responder.
function ConteudosDaTurma({ tipo, turmaId, educador, router }) {
  const styles = useStyles();
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
                <Text style={[styles.meta, { color: COLORS.text, fontFamily: FONTS.bodyBold }]}>{status}</Text>
              </Card>
            </Pressable>
          );
        })
      )}
    </>
  );
}

const useStyles = makeStyles(() => ({
  desc: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  codigo: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.orange, letterSpacing: 2 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6, minHeight: 44 },
  link: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.orange },
  cardTitle: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.hairline },
  nome: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.text, marginBottom: 2 },
  icone: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  resumo: { flexDirection: "row", gap: 8, marginVertical: 14 },
  resumoItem: { flex: 1, backgroundColor: COLORS.chip, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 6, alignItems: "center" },
  resumoN: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.text },
  resumoL: { fontFamily: FONTS.bodyBold, fontSize: 10.5, color: COLORS.textMuted, textAlign: "center", marginTop: 2 },
}));
