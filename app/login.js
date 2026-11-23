// ============================================================================
// app/login.js — tela de LOGIN (rota pública "/login")
// Equivale a pages/login.html + JS/auth.js (formLogin) do Web.
// Fluxo: valida campos → useAuth().login() → POST /login (cookie de sessão) →
// redireciona pelo tipo do usuário: educador → /educador, aluno → /aluno.
// Mensagens de erro/sucesso usam o componente <Message>.
// ============================================================================
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuth } from "../src/AuthContext";
import Button from "../src/components/Button";
import Message from "../src/components/Message";
import TextField from "../src/components/TextField";
import { COLORS, FONTS } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";

const logo = require("../assets/images/logo.png");

export default function Login() {
  const styles = useStyles();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

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

          {/* Recuperação de senha: no Web (rec-senha.html) existe só a interface, sem rota no servidor. */}
          <Pressable
            style={styles.esqueceuWrap}
            onPress={() => setMensagem({ texto: "A recuperação automática de senha ainda não existe no servidor. Fale com a equipe pelo Fale Conosco.", tipo: "sucesso" })}
            accessibilityRole="button"
          >
            <Text style={styles.esqueceu}>Esqueceu a senha?</Text>
          </Pressable>

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

const useStyles = makeStyles(() => ({
  scroll: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 24,
  },
  logo: { width: 120, height: 64, alignSelf: "center", marginBottom: 16 },
  title: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.text,
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
  esqueceuWrap: { alignSelf: "flex-end", minHeight: 44, justifyContent: "center", marginTop: 6 },
  esqueceu: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.text },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 16, flexWrap: "wrap" },
  linkText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
  link: { fontFamily: FONTS.bodyExtraBold, fontSize: 14, color: COLORS.text },
}));