import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import Button from "../src/components/Button";
import Message from "../src/components/Message";
import TextField from "../src/components/TextField";
import { COLORS, FONTS } from "../src/theme";

// contato.html wasn't part of this upload, so these channel details are
// placeholders reconstructed from the .canal-item styling in auth.css —
// swap in the real e-mail/phone/hours before shipping.
const CANAIS = [
  { label: "E-mail", value: "contato@conradvirtualschool.com" },
  { label: "Telefone", value: "(00) 0000-0000" },
  { label: "Atendimento", value: "Segunda a sexta, 8h às 18h" },
];

// .faq-titulo/.faq-item existem no CSS mas essa tela não veio na versão
// original enviada — perguntas placeholder, trocar pelas reais quando tiver.
const FAQ = [
  "Como faço para me cadastrar como aluno ou educador?",
  "Esqueci minha senha, e agora?",
  "Como falo direto com um educador?",
];

export default function Contato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nome.trim() || !email.trim() || !mensagemTexto.trim()) {
      setMensagem({ texto: "Preencha todos os campos.", tipo: "erro" });
      return;
    }
    setLoading(true);
    setMensagem(null);
    try {
      await api.contato({ nome: nome.trim(), email: email.trim(), mensagem: mensagemTexto.trim() });
      setMensagem({ texto: "Mensagem enviada com sucesso!", tipo: "sucesso" });
      setNome("");
      setEmail("");
      setMensagemTexto("");
    } catch (err) {
      setMensagem({ texto: err.message, tipo: "erro" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Fale conosco</Text>
        <Text style={styles.subtitle}>Dúvidas, sugestões ou problemas — escreva para a gente.</Text>

        <View style={styles.canaisCard}>
          {CANAIS.map((c) => (
            <View key={c.label} style={styles.canalItem}>
              <Text style={styles.canalLabel}>{c.label}</Text>
              <Text style={styles.canalValue}>{c.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.faqTitulo}>Perguntas frequentes</Text>
        {FAQ.map((pergunta) => (
          <View key={pergunta} style={styles.faqItem}>
            <Text style={styles.faqText}>{pergunta}</Text>
          </View>
        ))}

        <View style={styles.card}>
          <TextField label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" />
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
          />
          <TextField
            label="Mensagem"
            value={mensagemTexto}
            onChangeText={setMensagemTexto}
            multiline
            placeholder="Como podemos ajudar?"
          />

          <Message text={mensagem?.texto} type={mensagem?.tipo} />

          <Button label="Enviar mensagem" onPress={handleSubmit} loading={loading} style={{ marginTop: 20 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.navy, marginTop: 8 },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  canaisCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  canalItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  canalLabel: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.navy },
  canalValue: { fontFamily: FONTS.body, fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 },
  faqTitulo: {
    fontFamily: FONTS.display,
    fontSize: 18,
    letterSpacing: 0.5,
    color: COLORS.navy,
    marginTop: 4,
    marginBottom: 10,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  faqText: { fontFamily: FONTS.bodyBold, fontSize: 13.5, color: COLORS.text },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
});
