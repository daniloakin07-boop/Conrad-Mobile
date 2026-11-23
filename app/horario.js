// ============================================================================
// app/horario.js — HORÁRIO DAS AULAS (aluno)
// Equivale ao horário de pages/dashboard.html + JS/horarios.js. A grade é estática
// (src/data/data-horarios.js, cópia idêntica de data/horarios.json do Web): não há rota de horários no servidor.
// ============================================================================
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import horarios from "../src/data/data-horarios";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, Title } from "../src/ui/page";
import { makeStyles } from "../src/ui/estilos";

const DIAS = [["seg", "Seg"], ["ter", "Ter"], ["qua", "Qua"], ["qui", "Qui"], ["sex", "Sex"]];

export default function Horario() {
  const styles = useStyles();
  const [dia, setDia] = useState("seg");
  return (
    <Page>
      <Title sub="Grade semanal">Horário das aulas</Title>
      <View style={styles.tabs}>
        {DIAS.map(([k, l]) => (
          <Pressable key={k} onPress={() => setDia(k)} style={[styles.tab, dia === k && styles.tabOn]}>
            <Text style={[styles.tabT, dia === k && styles.tabTOn]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <Card>
        {horarios[dia].map((a, i) => (
          <View key={i} style={styles.aula}>
            <Text style={styles.hora}>{a.hora}</Text>
            <View style={styles.barra} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.materia, !a.sala && { color: COLORS.textMuted }]}>{a.materia}</Text>
              {a.sala ? <Text style={styles.sala}>{a.sala} · {a.professor}</Text> : null}
            </View>
          </View>
        ))}
      </Card>
    </Page>
  );
}

const useStyles = makeStyles(() => ({
  tabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: COLORS.chip, alignItems: "center" },
  tabOn: { backgroundColor: COLORS.navy },
  tabT: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.text },
  tabTOn: { color: COLORS.white },
  aula: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 },
  hora: { width: 46, fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text },
  barra: { width: 3, alignSelf: "stretch", backgroundColor: COLORS.orange, borderRadius: 2 },
  materia: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.text },
  sala: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
}));