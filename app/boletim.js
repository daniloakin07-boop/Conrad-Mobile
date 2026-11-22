import { Share, StyleSheet, Text, View } from "react-native";
import { api, useApi } from "../src/api";
import Button from "../src/components/Button";
import { dataBR, dataHoraBR, pts } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import Page, { Badge, Card, Empty, SoPara, Title } from "../src/ui/page";
import { makeStyles } from "../src/ui/estilos";

// Boletim do aluno: dados de GET /api/boletim (nota convertida para escala 10 pelo servidor).
export default function BoletimTela() {
  return (
    <SoPara tipo="aluno">
      <Boletim />
    </SoPara>
  );
}

function Boletim() {
  const styles = useStyles();
  const { data, loading, error, reload } = useApi(() => api.boletim(), []);
  const lista = data?.atividades || [];

  // Equivalente mobile do botão "Imprimir/PDF" do Web: compartilhar o resumo em texto.
  function compartilhar() {
    const linhas = lista.map(
      (a) => `• ${a.disciplina} — ${a.atividade}: ${a.notaEscala10 != null ? pts(a.notaEscala10) : "sem nota"}`
    );
    Share.share({
      message: [
        `Boletim de ${data.aluno?.nome || "estudante"} — CONRAD Virtual School`,
        `Turma: ${data.salaVirtual}`,
        `Média geral: ${data.mediaGeral != null ? pts(data.mediaGeral) : "—"}`,
        "",
        ...linhas,
        "",
        `Emitido em ${dataHoraBR(data.geradoEm)}`,
      ].join("\n"),
    });
  }

  return (
    <Page loading={loading && !data} error={error && !data ? error : ""} onRefresh={reload}>
      <Title sub={data?.salaVirtual ? `Turma: ${data.salaVirtual}` : undefined}>Boletim</Title>

      {data && (
        <>
          <Card style={styles.media}>
            <Text style={styles.mediaL}>Média geral (0 a 10)</Text>
            <Text style={styles.mediaN}>{data.mediaGeral != null ? pts(data.mediaGeral) : "—"}</Text>
            <Text style={styles.mediaS}>
              {data.totalNotas ?? 0} nota(s) lançada(s) em {data.totalAtividades ?? 0} atividade(s)
            </Text>
          </Card>

          {!data.vinculoSalaDetectado && (
            <Card style={{ backgroundColor: COLORS.warnBg }}>
              <Text style={styles.aviso}>
                Sua conta ainda não está vinculada a uma turma. Entre em uma turma com o código do professor para ver as atividades sem nota.
              </Text>
            </Card>
          )}

          {lista.length === 0 ? (
            <Empty text="Nenhuma atividade avaliativa por aqui ainda." />
          ) : (
            lista.map((a, i) => {
              const temNota = a.nota != null;
              return (
                <Card key={a.atividadeId ?? i}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.titulo}>{a.atividade}</Text>
                      <Text style={styles.meta}>{a.disciplina} · Aplicada em {dataBR(a.dataAplicacao)}</Text>
                      {temNota ? (
                        <Text style={styles.meta}>Nota bruta: {pts(a.nota)} de {pts(a.valorMaximo)}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.nota}>{a.notaEscala10 != null ? pts(a.notaEscala10) : "–"}</Text>
                  </View>
                  <View style={{ marginTop: 8 }}>
                    <Badge
                      label={temNota ? "Nota lançada" : "Aguardando nota"}
                      color={temNota ? COLORS.successText : COLORS.warnText}
                      bg={temNota ? COLORS.successBg : COLORS.warnBg}
                    />
                  </View>
                </Card>
              );
            })
          )}

          <View style={{ height: 8 }} />
          <Button label="Compartilhar boletim" onPress={compartilhar} />
          <Text style={styles.rodape}>Emitido em {dataHoraBR(data.geradoEm)}</Text>
        </>
      )}
    </Page>
  );
}

const useStyles = makeStyles(() => ({
  media: { backgroundColor: COLORS.navy, alignItems: "center" },
  mediaL: { fontFamily: FONTS.bodyBold, fontSize: 12, color: "#dfe7f6" },
  mediaN: { fontFamily: FONTS.display, fontSize: 52, color: COLORS.white },
  mediaS: { fontFamily: FONTS.body, fontSize: 12, color: "#dfe7f6" },
  aviso: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.warnText, lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  titulo: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.text },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  nota: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.orange },
  rodape: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted2, textAlign: "center", marginTop: 10 },
}));
