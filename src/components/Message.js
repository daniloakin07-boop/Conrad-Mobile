import { StyleSheet, Text } from "react-native";
import { COLORS, FONTS } from "../theme";
import { makeStyles } from "../ui/estilos";

// Mirrors .mensagem-auth / .mensagem-auth.sucesso / .mensagem-auth.erro
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