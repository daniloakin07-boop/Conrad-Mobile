// ============================================================================
// app/salas.js — SALAS DE VÍDEO
// Equivale a pages/salas.html + JS/salas.js. Lista as turmas (GET /api/turmas) e abre a sala
// do Jitsi Meet (campo turma.video_room), a mesma usada pelo site. O código do Conrad não
// autentica pessoas dentro do Jitsi.
// ============================================================================
import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, Empty, Title } from "../src/ui/page";
import { useApi } from "../src/api";
import { makeStyles } from "../src/ui/estilos";

export default function Salas() {
  const styles = useStyles();
  const { data, loading, error, reload } = useApi(() => api.turmas(), []);
  const turmas = data?.turmas || [];

  return (
    <Page loading={loading} error={error} onRefresh={reload}>
      <Title sub="Aulas ao vivo por vídeo">Salas de vídeo</Title>
      {turmas.length === 0 ? (
        <Empty text="Você ainda não tem turmas com sala de vídeo." />
      ) : (
        turmas.map((t) => (
          <Card key={t.id}>
            <Text style={styles.nome}>{t.nome}</Text>
            <Text style={styles.meta}>{t.disciplina} · Prof. {t.professor}</Text>
            <Pressable
              style={[styles.btn, !t.video_room && { opacity: 0.5 }]}
              disabled={!t.video_room}
              onPress={() => Linking.openURL(`https://meet.jit.si/${encodeURIComponent(t.video_room)}`)}
            >
              <Ionicons name="videocam" size={18} color={COLORS.white} />
              <Text style={styles.btnT}>Entrar na sala</Text>
            </Pressable>
          </Card>
        ))
      )}
    </Page>
  );
}

const useStyles = makeStyles(() => ({
  nome: { fontFamily: FONTS.bodyExtraBold, fontSize: 16, color: COLORS.text },
  meta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 2, marginBottom: 10 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.orange, borderRadius: 10, paddingVertical: 11 },
  btnT: { fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.white },
}));