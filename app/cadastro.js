import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import Message from "../src/components/Message";
import TextField from "../src/components/TextField";
import TypeSelector from "../src/components/TypeSelector";
import { COLORS, FONTS } from "../src/theme";

const logo = require("../assets/images/logo.png");

const TIPOS = [
  { label: "Aluno", value: "aluno" },
  { label: "Educador", value: "educador" },
];

export default function Cadastro() {
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmasenha, setConfirmasenha] = useState("");
  const [tipo, setTipo] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nome.trim() || !email.trim() || !senha || !confirmasenha) {
      setMensagem({ texto: "Preencha todos os campos.", tipo: "erro" });
      return;
    }
    if (senha !== confirmasenha) {
      setMensagem({ texto: "As senhas não coincidem.", tipo: "erro" });
      return;
    }
    if (!tipo) {
      setMensagem({ texto: "Selecione um tipo de usuário.", tipo: "erro" });
      return;
    }
    setLoading(true);
    setMensagem(null);
    try {
      const usuario = await cadastrar({ nome: nome.trim(), email: email.trim(), senha, tipo });
      setMensagem({ texto: "Cadastro realizado com sucesso!", tipo: "sucesso" });
      router.replace(usuario.tipo === "educador" ? "/educador" : "/aluno");
    } catch (err) {
      setMensagem({ texto: err.message, tipo: "erro" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Leva menos de um minuto.</Text>

          <TextField label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome completo" />
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
          />
          <TextField label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="••••••••" />
          <TextField
            label="Confirmar senha"
            value={confirmasenha}
            onChangeText={setConfirmasenha}
            secureTextEntry
            placeholder="••••••••"
          />
          <TypeSelector label="Tipo de usuário" options={TIPOS} value={tipo} onChange={setTipo} />

          <Message text={mensagem?.texto} type={mensagem?.tipo} />

          <Button label="Criar conta" onPress={handleSubmit} loading={loading} style={{ marginTop: 20 }} />

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Já tem conta? </Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={styles.link}>Entrar</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, padding: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 24,
    marginVertical: 20,
  },
  logo: { width: 120, height: 64, alignSelf: "center", marginBottom: 16 },
  title: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.navy,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 16, flexWrap: "wrap" },
  linkText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
  link: { fontFamily: FONTS.bodyExtraBold, fontSize: 14, color: COLORS.navy },
});
