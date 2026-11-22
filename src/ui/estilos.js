import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTema } from "../ThemeContext";

// makeStyles(() => ({ ... })) devolve um hook que recria os estilos quando o tema
// muda. Dentro da fábrica, COLORS já tem os valores do tema atual.
export function makeStyles(factory) {
  return function useStyles() {
    const { tema } = useTema();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => StyleSheet.create(factory()), [tema]);
  };
}
