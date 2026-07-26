import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((data) => setUsuario(data.logado ? data.usuario : null))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, senha) => {
    const data = await api.login({ email, senha });
    setUsuario(data.usuario);
    return data.usuario;
  }, []);

  const cadastrar = useCallback(async (payload) => {
    const data = await api.cadastro(payload);
    setUsuario(data.usuario);
    return data.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUsuario(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, checking, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>.");
  return ctx;
}
