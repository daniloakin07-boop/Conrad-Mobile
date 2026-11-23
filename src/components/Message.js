// ============================================================================
// src/components/Message.js — mensagem de erro/sucesso dos formulários
// Usado por login, cadastro, contato, turmas, perfil, criação e correção de atividades.
// ============================================================================
import { StyleSheet, Text } from "react-native";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";

// Espelha .mensagem-auth (.sucesso / .erro) do Web. Não renderiza nada se `text` for vazio.
// Props: text (mensagem) e type ("erro" ou, por padrão, sucesso).
export default function Message({ text, type }) {
  const styles = useStyles();
  if (!text) return null;
  return (
    <Text style={[styles.base, type === "erro" ? styles.erro : styles.sucesso]}>
      {text}
    </Text>
  );
}

const useStyles = makeStyles(() => ({
  base: {
    fontFamily: FONTS.body,
    fontSize: 13.5,
    marginTop: 12,
    textAlign: "center",
  },
  sucesso: { color: COLORS.success },
  erro: { color: COLORS.error },
}));