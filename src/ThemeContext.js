// ============================================================================
// src/ThemeContext.js — tema normal/claro/escuro
// Os três temas do Web (CSS/variaveis.css + JS/tema.js).
// ============================================================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { aplicarPaleta, TEMA_INFO, TEMAS } from "./theme";

// Porte de JS/tema.js: três estados (normal → claro → escuro → normal) e preferência
// persistida (localStorage "conrad-tema" no Web; AsyncStorage com a MESMA chave aqui).
// Expõe: tema, info (rótulo/ícone), pronto, definir(tema) e alternar().
// Os estilos das telas são refeitos por makeStyles (src/ui/estilos.js) quando o tema muda.
const CHAVE = "conrad-tema";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState("normal");
  const [pronto, setPronto] = useState(false);

  // Aplica a paleta ANTES de renderizar os filhos (COLORS é um objeto mutável).
  aplicarPaleta(tema);

  // Lê a preferência salva ao iniciar.
  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((salvo) => {
        if (TEMAS.includes(salvo)) setTema(salvo);
      })
      .catch(() => {})
      .finally(() => setPronto(true));
  }, []);

  const definir = useCallback((novo) => {
    if (!TEMAS.includes(novo)) return;
    setTema(novo);
    AsyncStorage.setItem(CHAVE, novo).catch(() => {});
  }, []);

  const alternar = useCallback(() => {
    setTema((atual) => {
      const proximo = TEMA_INFO[atual].proximo;
      AsyncStorage.setItem(CHAVE, proximo).catch(() => {});
      return proximo;
    });
  }, []);

  const value = useMemo(() => ({ tema, info: TEMA_INFO[tema], pronto, definir, alternar }), [tema, pronto, definir, alternar]);
  // Só mostra o app depois de ler a preferência salva (evita piscar o tema errado).
  return <ThemeContext.Provider value={value}>{pronto ? children : null}</ThemeContext.Provider>;
}

export function useTema() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTema precisa ser usado dentro de <ThemeProvider>.");
  return ctx;
}
