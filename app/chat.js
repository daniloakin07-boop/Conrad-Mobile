import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, Empty, Title } from "../src/ui/page";
import { useApi } from "../src/api";

export default function ChatLista() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => api.chatContatos(), []);
  const contatos = data?.contatos || [];

  const porTurma = {};
  contatos.forEach((c) => {
    (porTurma[c.turmaId] ||= { nome: c.turmaNome, disciplina: c.disciplina, itens: [] }).itens.push(c);
  });

  return (
    <Page loading={loading} error={error} onRefresh={reload}>
      <Title sub="Converse com seus professores e alunos">Bate-papo</Title>
      {contatos.length === 0 ? (
        <Empty text="Você ainda não tem contatos. Entre em uma turma para conversar." />
      ) : (
        Object.entries(porTurma).map(([turmaId, t]) => (
          <Card key={turmaId} style={{ paddingVertical: 6 }}>
            <Text style={s.turma}>{t.nome} <Text style={s.disc}>· {t.disciplina}</Text></Text>
            {t.itens.map((c) => (
              <Pressable
                key={`${c.turmaId}-${c.participanteId}`}
                style={s.row}
                onPress={() =>
                  router.push({
                    pathname: "/conversa",
                    params: { turmaId: c.turmaId, participanteId: c.participanteId, nome: c.participanteNome },
                  })
                }
              >
                <View style={s.avatar}><Text style={s.avatarT}>{c.participanteNome[0]?.toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.nome}>{c.participanteNome}</Text>
                  <Text style={s.papel}>{c.participantePapel}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9aa1ab" />
              </Pressable>
            ))}
          </Card>
        ))
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  turma: { fontFamily: FONTS.bodyExtraBold, fontSize: 14, color: COLORS.navy, paddingVertical: 8 },
  disc: { fontFamily: FONTS.body, color: COLORS.textMuted },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#eef1f4" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.navy, alignItems: "center", justifyContent: "center" },
  avatarT: { fontFamily: FONTS.bodyBold, fontSize: 15, color: COLORS.white },
  nome: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.navy },
  papel: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted },
});