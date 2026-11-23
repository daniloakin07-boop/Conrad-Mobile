// ============================================================================
// app/contato.js — "Fale conosco" (rota pública "/contato")
// Equivale a pages/contato.html + JS/auth.js (formContato) do Web.
// Envia { nome, email, mensagem } para POST /contato (tabela tb_contatos).
// Validações iguais às do Web: campos obrigatórios e mensagem de 10 a 300 caracteres.
// Os canais de atendimento e as perguntas frequentes abaixo foram copiados de
// pages/contato.html (não são mais textos de exemplo).
// ============================================================================
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { api } from "../src/api";
import Button from "../src/components/Button";
import Message from "../src/components/Message";
import TextField from "../src/components/TextField";
import { COLORS, FONTS } from "../src/theme";
import { makeStyles } from "../src/ui/estilos";

// Canais de atendimento (mesmos dados de pages/contato.html).
const CANAIS = [
  { label: "E-mail", value: "atendimento@conradschool.com.br" },
  { label: "WhatsApp", value: "(11) 99999-9999" },
  { label: "Telefone", value: "(11) 3333-3333" },
  { label: "Horário de atendimento", value: "Segunda a sexta, das 9h às 18h" },
  { label: "Endereço", value: "Rua das Escolas, 123 - W3 - SP, 01000-000" },
];

// Perguntas frequentes (mesmos títulos do Web; no Web também são apenas rótulos).
const FAQ = [
  "Como redefinir minha senha?",
  "Como acessar as aulas ao vivo?",
  "Como entregar uma atividade?",
  "Quais são os horários de atendimento?",
];

export default function Contato() {
  const styles = useStyles();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [mensagem, setMensagem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const texto = mensagemTexto.trim();
    if (!nome.trim() || !email.trim() || !texto) {
      setMensagem({ texto: "Preencha todos os campos.", tipo: "erro" });
      return;
    }
    // Limites de JS/auth.js (Web).
    if (texto.length < 10) {
      setMensagem({ texto: "A mensagem deve ter no mínimo 10 caracteres.", tipo: "erro" });
      return;
    }
    if (texto.length > 300) {
      setMensagem({ texto: "A mensagem deve ter no máximo 300 caracteres.", tipo: "erro" });
      return;
    }
    setLoading(true);
    setMensagem(null);
    try {
      await api.contato({ nome: nome.trim(), email: email.trim(), mensagem: texto });
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
        <Text style={styles.etiqueta}>Estamos aqui para ajudar</Text>
        <Text style={styles.title}>Vamos conversar?</Text>
        <Text style={styles.subtitle}>
          Envie sua dúvida para nossa equipe ou escolha um dos canais de atendimento. Será um prazer ajudar.
        </Text>

        <Text style={styles.faqTitulo}>Canais de atendimento</Text>
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

        <Text style={[styles.faqTitulo, { marginTop: 12 }]}>Envie sua mensagem</Text>
        <View style={styles.card}>
          <TextField label="Nome" value={nome} onChangeText={setNome} placeholder="Digite seu nome completo" />
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Digite seu e-mail"
          />
          <TextField
            label="Mensagem"
            value={mensagemTexto}
            onChangeText={setMensagemTexto}
            multiline
            maxLength={300}
            placeholder="Digite sua mensagem aqui..."
          />
          <Text style={styles.contador}>{mensagemTexto.length}/300</Text>

          <Message text={mensagem?.texto} type={mensagem?.tipo} />

          <Button label="Enviar" onPress={handleSubmit} loading={loading} style={{ marginTop: 16 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles(() => ({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, padding: 20 },
  etiqueta: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.orange, letterSpacing: 1, textTransform: "uppercase" },
  title: { fontFamily: FONTS.display, fontSize: 30, color: COLORS.text, marginTop: 4 },
  subtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted, marginBottom: 20, lineHeight: 21 },
  canaisCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  canalItem: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 12, marginBottom: 8 },
  canalLabel: { fontFamily: FONTS.bodyBold, fontSize: 13, color: COLORS.text },
  canalValue: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  faqTitulo: { fontFamily: FONTS.display, fontSize: 20, letterSpacing: 0.5, color: COLORS.text, marginTop: 4, marginBottom: 10 },
  faqItem: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, padding: 12, marginBottom: 8 },
  faqText: { fontFamily: FONTS.bodyBold, fontSize: 13.5, color: COLORS.text },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 20, marginBottom: 24 },
  contador: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted2, textAlign: "right", marginTop: 4 },
}));
