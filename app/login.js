import { Ionicons } from "@expo/vector-icons";
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
import { COLORS, FONTS } from "../src/theme";

const logo = require("../assets/images/logo.png");

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lembrar, setLembrar] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !senha) {
      setMensagem({ texto: "Preencha todos os campos.", tipo: "erro" });
      return;
    }
    setLoading(true);
    setMensagem(null);
    try {
      const usuario = await login(email.trim(), senha);
      setMensagem({ texto: "Login realizado com sucesso!", tipo: "sucesso" });
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
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre com seus dados para continuar.</Text>

          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
          />
          <TextField
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="••••••••"
          />

          <View style={styles.formRow}>
            <Pressable style={styles.lembrar} onPress={() => setLembrar((v) => !v)}>
              <Ionicons
                name={lembrar ? "checkbox" : "square-outline"}
                size={18}
                color={COLORS.navy}
              />
              <Text style={styles.lembrarText}>Lembrar-me</Text>
            </Pressable>
            <Pressable onPress={() => setMensagem({ texto: "Fale com a equipe pelo Fale Conosco para redefinir sua senha.", tipo: "sucesso" })}>
              <Text style={styles.esqueceu}>Esqueceu a senha?</Text>
            </Pressable>
          </View>

          <Message text={mensagem?.texto} type={mensagem?.tipo} />

          <Button label="Entrar" onPress={handleSubmit} loading={loading} style={{ marginTop: 20 }} />

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Ainda não tem conta? </Text>
            <Pressable onPress={() => router.replace("/cadastro")}>
              <Text style={styles.link}>Criar conta</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 24,
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
  formRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
    flexWrap: "wrap",
    gap: 8,
  },
  lembrar: { flexDirection: "row", alignItems: "center", gap: 6 },
  lembrarText: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.text },
  esqueceu: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.navy },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 16, flexWrap: "wrap" },
  linkText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
  link: { fontFamily: FONTS.bodyExtraBold, fontSize: 14, color: COLORS.navy },
});
