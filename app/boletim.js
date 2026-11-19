import { StyleSheet, Text, View } from "react-native";
import { api } from "../../src/api";
import { COLORS, FONTS } from "../../src/theme";
import Page, { Card, Empty, Title } from "../../src/ui/Page";
import { useApi } from "../../src/ui/useApi";

export default function Boletim() {
  const { data, loading, error, reload } = useApi(() => api.boletim(), []);
  const lista = data?.atividades || [];

  return (
    <Page loading={loading} error={error} onRefresh={reload}>
      <Title sub={data?.salaVirtual ? `Turma: ${data.salaVirtual}` : undefined}>Boletim</Title>
      <Card style={styles.media}>
        <Text style={styles.mediaL}>Média geral</Text>
        <Text style={styles.mediaN}>{data?.mediaGeral ?? "–"}</Text>
      </Card>
      {lista.length === 0 ? (
        <Empty text="Nenhuma nota lançada ainda." />
      ) : (
        lista.map((a, i) => (
          <Card key={a.atividadeId ?? i}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.titulo}>{a.atividade}</Text>
                <Text style={styles.meta}>{a.disciplina}</Text>
              </View>
              <Text style={styles.nota}>{a.notaEscala10 ?? "–"}</Text>
            </View>
          </Card>
        ))
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  media: { backgroundColor: COLORS.navy, alignItems: "center" },
  mediaL: { fontFamily: FONTS.bodyBold, fontSize: 12, color: "#dfe7f6" },
  mediaN: { fontFamily: FONTS.display, fontSize: 48, color: COLORS.white },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  titulo: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.navy },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  nota: { fontFamily: FONTS.display, fontSize: 28, color: COLORS.orange },
});