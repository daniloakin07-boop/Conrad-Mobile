// ============================================================================
// src/AuthContext.js — sessão do usuário (Context API)
// Equivale ao GET /me + layout.js do Web. Consumido por app/_layout.js, SiteHeader e telas.
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, setUnauthorizedHandler } from "./api";

// Contexto global da sessão. Expõe: usuario ({id,nome,email,tipo} ou null), setUsuario,
// checking (true enquanto o /me inicial não respondeu), login, cadastrar, logout e excluirConta.
const AuthContext = createContext(null);

// Provedor: coloque-o acima das telas (feito em app/_layout.js).
// A sessão mora no COOKIE do servidor (express-session, validade de 1 h); o app só guarda
// em memória o usuário devolvido. Ao abrir o app, GET /me recupera a sessão existente.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [checking, setChecking] = useState(true);

  // Recuperação da sessão ao iniciar o app.
  useEffect(() => {
    api
      .me()
      .then((data) => setUsuario(data.logado ? data.usuario : null))
      .finally(() => setChecking(false));
  }, []);

  // Faz login (POST /login) e guarda o usuário. Lança Error com a mensagem do servidor se falhar.
  const login = useCallback(async (email, senha) => {
    const data = await api.login({ email, senha });
    setUsuario(data.usuario);
    return data.usuario;
  }, []);

  // Cria a conta (POST /cadastro); o servidor já abre a sessão.
  const cadastrar = useCallback(async (payload) => {
    const data = await api.cadastro(payload);
    setUsuario(data.usuario);
    return data.usuario;
  }, []);

  // Sessão expirada no servidor (cookie de 1 h): volta para o login.
  useEffect(() => {
    setUnauthorizedHandler(() => setUsuario(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // Encerra a sessão no servidor (POST /logout) e limpa o usuário local, mesmo se a rede falhar.
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUsuario(null);
    }
  }, []);

  // Exclui DEFINITIVAMENTE a conta (DELETE /conta). O estado local só é limpo DEPOIS que o
  // servidor confirma: se a senha estiver errada ou a rede falhar, o erro sobe para a tela e o
  // usuário continua logado. Em caso de sucesso o servidor já encerrou a sessão e invalidou o
  // cookie; aqui zeramos o usuário, o que faz o layout raiz (app/_layout.js) voltar ao login.
  const excluirConta = useCallback(async (senha) => {
    const resposta = await api.excluirConta(senha);
    setUsuario(null);
    return resposta;
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, checking, login, cadastrar, logout, excluirConta }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acesso ao contexto; lança erro se usado fora do <AuthProvider>.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>.");
  return ctx;
}