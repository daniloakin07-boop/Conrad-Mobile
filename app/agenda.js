// ============================================================================
// app/agenda.js — AGENDA SEMANAL (educador)
// Equivale a pages/agenda-professor.html + JS/agenda-professor.js. No Web os eventos existem só
// na página (somem ao recarregar) e não há rota de agenda no servidor. No app ficam salvos NO APARELHO
// (AsyncStorage, chave "conrad:agenda"); segure um evento para removê-lo.
// ============================================================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../src/components/Button";
import TextField from "../src/components/TextField";
import { COLORS, FONTS } from "../src/theme";
import Page, { Card, SoPara, Title } from "../src/ui/page";
import { makeStyles } from "../src/ui/estilos";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const CHAVE = "conrad:agenda";

// Agenda do professor. Não existe rota de agenda no servidor (no Web ela nem persiste):
// aqui os eventos ficam salvos só neste aparelho, sem dados de exemplo.
export default function AgendaTela() {
  return (
    <SoPara tipo="educador">
      <Agenda />
    </SoPara>
  );
}

function Agenda() {
  const styles = useStyles();
  const [eventos, setEventos] = useState([]);
  const [novo, setNovo] = useState(false);
  const [dia, setDia] = useState("Seg");
  const [hora, setHora] = useState("");
  const [titulo, setTitulo] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(CHAVE).then((v) => v && setEventos(JSON.parse(v))).catch(() => {});
  }, []);

  function salvar(lista) {
    setEventos(lista);
    AsyncStorage.setItem(CHAVE, JSON.stringify(lista)).catch(() => {});
  }

  function adicionar() {
    if (!titulo.trim()) return;
    salvar([...eventos, { id: String(Date.now()), dia, hora: hora.trim(), titulo: titulo.trim() }]);
    setHora(""); setTitulo(""); setNovo(false);
  }

  return (
    <Page>
      <Title sub="Visão semanal das suas turmas e compromissos">Agenda</Title>
      <Button label={novo ? "Cancelar" : "+ Novo evento"} variant={novo ? "solid" : "cta"} onPress={() => setNovo(!novo)} />

      {novo && (
        <Card style={{ marginTop: 12 }}>
          <View style={styles.dias}>
            {DIAS.map((d) => (
              <Pressable key={d} onPress={() => setDia(d)} style={[styles.dia, dia === d && styles.diaOn]}>
                <Text style={[styles.diaT, dia === d && { color: COLORS.white }]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          <TextField label="Horário" value={hora} onChangeText={setHora} placeholder="8:00" />
          <TextField label="Título" value={titulo} onChangeText={setTitulo} />
          <View style={{ height: 12 }} />
          <Button label="Salvar" onPress={adicionar} />
        </Card>
      )}

      <View style={{ height: 12 }} />
      {DIAS.map((d) => {
        const lista = eventos.filter((e) => e.dia === d);
        return (
          <Card key={d}>
            <Text style={styles.diaTitulo}>{d}</Text>
            {lista.length === 0 ? (
              <Text style={styles.livre}>Livre</Text>
            ) : (
              lista.map((e) => (
                <Pressable key={e.id} style={styles.evento} onLongPress={() => salvar(eventos.filter((x) => x.id !== e.id))}>
                  <Text style={styles.evT}>{e.hora ? `${e.hora} · ` : ""}{e.titulo}</Text>
                </Pressable>
              ))
            )}
          </Card>
        );
      })}
      <Text style={styles.dica}>Segure um evento para removê-lo.</Text>
    </Page>
  );
}

const useStyles = makeStyles(() => ({
  dias: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  dia: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: COLORS.chip },
  diaOn: { backgroundColor: COLORS.navy },
  diaT: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.text },
  diaTitulo: { fontFamily: FONTS.bodyExtraBold, fontSize: 15, color: COLORS.text, marginBottom: 4 },
  livre: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted },
  evento: { paddingVertical: 6 },
  evT: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.text },
  dica: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted2, textAlign: "center" },
}));