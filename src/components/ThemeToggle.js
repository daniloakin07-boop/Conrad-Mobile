import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useTema } from "../ThemeContext";
import { COLORS } from "../theme";
import { makeStyles } from "../ui/estilos";

// Botão #theme do cabeçalho do Web: alterna normal -> claro -> escuro -> normal,
// troca o ícone (◉ ☀ ☾) e o rótulo de acessibilidade, e persiste a escolha.
export default function ThemeToggle({ size = 36 }) {
  const styles = useStyles();
  const { info, alternar } = useTema();
  return (
    <Pressable
      onPress={alternar}
      accessibilityRole="button"
      accessibilityLabel={info.acao}
      hitSlop={6}
      style={({ pressed }) => [styles.btn, { width: size, height: size, borderRadius: size / 2 }, pressed && styles.pressed]}
    >
      <Ionicons name={info.icone} size={Math.round(size * 0.5)} color={COLORS.headerText} />
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    backgroundColor: COLORS.overlay,
  },
  pressed: { opacity: 0.7 },
}));
