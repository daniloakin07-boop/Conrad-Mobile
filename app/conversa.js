import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BASE_URL } from "../src/api";
import { useAuth } from "../src/AuthContext";
import { conectarChat } from "../src/components/socket";
import { COLORS, FONTS } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";

export default function Conversa() {
  const s = useS();
  const { turmaId, participanteId, nome } = useLocalSearchParams();
  const { usuario } = useAuth();
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [status, setStatus] = useState("Conectando…");
  const [gravando, setGravando] = useState(null);
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const socket = conectarChat();
    socketRef.current = socket;

    const entrar = () => {
      socket.emit("chat:entrar", { turmaId: Number(turmaId), participanteId: Number(participanteId) }, (r) => {
        if (r?.ok) { setMensagens(r.mensagens || []); setStatus(""); }
        else setStatus(r?.erro || "Não foi possível abrir a conversa.");
      });
    };
    socket.on("connect", entrar);
    socket.on("connect_error", () => setStatus("Sem conexão com o servidor. Tentando de novo…"));
    socket.on("chat:mensagem", (m) => setMensagens((ms) => (ms.some((x) => x.id === m.id) ? ms : [...ms, m])));
    return () => { socket.disconnect(); };
  }, [turmaId, participanteId]);

  useEffect(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50); }, [mensagens.length]);

  function enviar(payload) {
    socketRef.current?.emit("chat:enviar", payload, (r) => {
      if (!r?.ok) setStatus(r?.erro || "Não foi possível enviar.");
      else setStatus("");
    });
  }

  function enviarTexto() {
    const t = texto.trim();
    if (!t) return;
    enviar({ tipo: "texto", conteudo: t });
    setTexto("");
  }

  async function enviarImagem() {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });
    if (r.canceled || !r.assets?.[0]?.base64) return;
    const a = r.assets[0];
    const mime = a.mimeType && /^image\/(jpeg|png|webp|gif)$/.test(a.mimeType) ? a.mimeType : "image/jpeg";
    enviar({ tipo: "imagem", conteudo: `data:${mime};base64,${a.base64}`, nomeArquivo: a.fileName || "imagem" });
  }

  async function alternarGravacao() {
    if (gravando) {
      try {
        await gravando.stopAndUnloadAsync();
        const uri = gravando.getURI();
        setGravando(null);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        enviar({ tipo: "audio", conteudo: `data:audio/mp4;base64,${b64}`, nomeArquivo: "mensagem de voz" });
      } catch { setGravando(null); setStatus("Não foi possível enviar o áudio."); }
      return;
    }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return setStatus("Permita o microfone para gravar áudio.");
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setGravando(recording);
    } catch { setStatus("Não foi possível gravar."); }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: nome || "Conversa" }} />
      <FlatList
        ref={listRef}
        data={mensagens}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 14, gap: 8 }}
        renderItem={({ item }) => <Bolha m={item} minha={Number(item.autorId) === Number(usuario.id)} />}
        ListEmptyComponent={!status ? <Text style={s.vazio}>Nenhuma mensagem ainda. Diga olá!</Text> : null}
      />
      {status ? <Text style={s.status}>{status}</Text> : null}
      <View style={[s.barra, { paddingBottom: 10 + insets.bottom }]}>
        <Pressable onPress={enviarImagem} hitSlop={8}><Ionicons name="image-outline" size={24} color={COLORS.text} /></Pressable>
        <TextInput
          style={s.input}
          value={texto}
          onChangeText={setTexto}
          placeholder={gravando ? "Gravando áudio…" : "Mensagem"}
          placeholderTextColor={COLORS.placeholder}
          editable={!gravando}
          multiline
          maxLength={2000}
        />
        {texto.trim() ? (
          <Pressable onPress={enviarTexto} style={s.send}><Ionicons name="send" size={18} color={COLORS.white} /></Pressable>
        ) : (
          <Pressable onPress={alternarGravacao} style={[s.send, gravando && { backgroundColor: COLORS.error }]}>
            <Ionicons name={gravando ? "stop" : "mic"} size={18} color={COLORS.white} />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Bolha({ m, minha }) {
  const s = useS();
  const [som, setSom] = useState(null);
  useEffect(() => () => { som?.unloadAsync(); }, [som]);

  // O anexo exige sessão. O player nativo pode não enviar o cookie, então o áudio
  // é baixado com fetch (que envia) para o cache e tocado a partir do arquivo local.
  async function tocar() {
    try {
      if (som) { await som.replayAsync(); return; }
      const resp = await fetch(`${BASE_URL}${m.anexoUrl}`, { credentials: "include" });
      if (!resp.ok) throw new Error("anexo");
      const blob = await resp.blob();
      const b64 = await new Promise((ok, falha) => {
        const r = new FileReader();
        r.onloadend = () => ok(String(r.result).split(",")[1]);
        r.onerror = falha;
        r.readAsDataURL(blob);
      });
      const arquivo = `${FileSystem.cacheDirectory}chat-${m.id}.m4a`;
      await FileSystem.writeAsStringAsync(arquivo, b64, { encoding: FileSystem.EncodingType.Base64 });
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: arquivo }, { shouldPlay: true });
      setSom(sound);
    } catch {}
  }

  return (
    <View style={[s.bolha, minha ? s.minha : s.outra]}>
      {!minha && <Text style={s.autor}>{m.autor}</Text>}
      {m.tipo === "imagem" && m.anexoUrl ? (
        <Image source={{ uri: `${BASE_URL}${m.anexoUrl}` }} style={s.img} resizeMode="cover" />
      ) : m.tipo === "audio" ? (
        <Pressable onPress={tocar} style={s.audio}>
          <Ionicons name="play-circle" size={28} color={minha ? COLORS.white : COLORS.navy} />
          <Text style={[s.txt, minha && { color: COLORS.white }]}>Mensagem de voz</Text>
        </Pressable>
      ) : (
        <Text style={[s.txt, minha && { color: COLORS.white }]}>{m.conteudo}</Text>
      )}
      <Text style={[s.hora, minha && { color: "#cdd8ea" }]}>
        {new Date(m.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );
}

const useS = makeStyles(() => ({
  vazio: { textAlign: "center", fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted2, marginTop: 30 },
  status: { textAlign: "center", fontFamily: FONTS.body, fontSize: 12, color: COLORS.error, paddingVertical: 4 },
  bolha: { maxWidth: "80%", borderRadius: 14, padding: 10 },
  minha: { alignSelf: "flex-end", backgroundColor: COLORS.navy, borderBottomRightRadius: 4 },
  outra: { alignSelf: "flex-start", backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  autor: { fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.orange, marginBottom: 2 },
  txt: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  hora: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.textMuted2, alignSelf: "flex-end", marginTop: 3 },
  img: { width: 200, height: 200, borderRadius: 10 },
  audio: { flexDirection: "row", alignItems: "center", gap: 6 },
  barra: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 10, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, maxHeight: 110, borderWidth: 1, borderColor: COLORS.borderInput, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text },
  send: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.orange, alignItems: "center", justifyContent: "center" },
}));