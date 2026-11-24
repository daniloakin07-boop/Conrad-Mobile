// ============================================================================
// app/assistente.js — ASSISTENTE DE IA (aluno e educador)
// Chat que pergunta ao servidor (POST /api/agente, api.agente). O servidor
// identifica quem é pela sessão e só consulta os dados dessa pessoa.
// ============================================================================
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../src/api";
import { useAuth } from "../src/AuthContext";
import { ehEducador } from "../src/format";
import { COLORS, FONTS } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";

const SUGESTOES_ALUNO = [
  "Quais atividades tenho para entregar?",
  "O que está marcado para hoje?",
  "Quais aulas tenho hoje?",
  "Tenho atividades atrasadas?",
];
const SUGESTOES_EDUCADOR = [
  "Quais são as minhas turmas?",
  "Quais atividades têm data de hoje?",
  "Quantos alunos não entregaram a última atividade?",
];

export default function Assistente() {
  const s = useS();
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const sugestoes = ehEducador(usuario) ? SUGESTOES_EDUCADOR : SUGESTOES_ALUNO;

  async function perguntar(pergunta) {
    const p = String(pergunta || "").trim();
    if (!p || carregando) return;
    const historico = mensagens.filter((m) => !m.erro).map(({ role, content }) => ({ role, content }));
    setMensagens((atual) => [...atual, { id: `u${Date.now()}`, role: "user", content: p }]);
    setTexto("");
    setCarregando(true);
    try {
      const { resposta } = await api.agente(p, historico);
      setMensagens((atual) => [...atual, { id: `a${Date.now()}`, role: "assistant", content: resposta }]);
    } catch (e) {
      setMensagens((atual) => [
        ...atual,
        { id: `e${Date.now()}`, role: "assistant", content: e.message || "Não foi possível responder.", erro: true },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={mensagens}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 14, gap: 8, flexGrow: 1 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[s.bolha, item.role === "user" ? s.minha : s.outra, item.erro && s.erroBolha]}>
            <Text style={[s.txt, item.role === "user" && { color: COLORS.white }, item.erro && { color: COLORS.error }]}>
              {item.content}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.intro}>
            <Ionicons name="sparkles" size={30} color={COLORS.orange} />
            <Text style={s.introT}>Olá, {String(usuario?.nome || "").trim().split(/\s+/)[0]}!</Text>
            <Text style={s.introS}>Pergunte sobre suas atividades, aulas e notas. Eu consulto o sistema e respondo.</Text>
            <View style={s.chips}>
              {sugestoes.map((q) => (
                <Pressable key={q} style={s.chip} onPress={() => perguntar(q)}>
                  <Text style={s.chipT}>{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListFooterComponent={
          carregando ? (
            <View style={[s.bolha, s.outra, { flexDirection: "row", gap: 8, alignItems: "center" }]}>
              <ActivityIndicator size="small" color={COLORS.text} />
              <Text style={s.txt}>Consultando…</Text>
            </View>
          ) : null
        }
      />
      <View style={[s.barra, { paddingBottom: 10 + insets.bottom }]}>
        <TextInput
          style={s.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Pergunte algo…"
          placeholderTextColor={COLORS.placeholder}
          multiline
          maxLength={500}
          editable={!carregando}
        />
        <Pressable
          onPress={() => perguntar(texto)}
          disabled={!texto.trim() || carregando}
          style={[s.send, (!texto.trim() || carregando) && { opacity: 0.5 }]}
        >
          <Ionicons name="send" size={18} color={COLORS.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const useS = makeStyles(() => ({
  bolha: { maxWidth: "85%", borderRadius: 14, padding: 10 },
  minha: { alignSelf: "flex-end", backgroundColor: COLORS.navy, borderBottomRightRadius: 4 },
  outra: { alignSelf: "flex-start", backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  erroBolha: { backgroundColor: COLORS.errorBg, borderColor: COLORS.error },
  txt: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  intro: { alignItems: "center", paddingTop: 30, gap: 6 },
  introT: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.text },
  introS: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, textAlign: "center", paddingHorizontal: 20, marginBottom: 10 },
  chips: { gap: 8, alignSelf: "stretch" },
  chip: { borderRadius: 14, backgroundColor: COLORS.chip, paddingVertical: 12, paddingHorizontal: 14 },
  chipT: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.text },
  barra: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 10, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, maxHeight: 110, borderWidth: 1, borderColor: COLORS.borderInput, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text },
  send: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center" },
}));
