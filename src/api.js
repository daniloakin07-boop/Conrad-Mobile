import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";

function resolveDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    "";
  const host = hostUri.split(":")[0];
  return host && host.length > 0 ? host : "localhost";
}

const DEV_HOST = resolveDevHost();

export const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000`
  : "https://conrad-virtual-school.onrender.com";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error("Erro ao conectar com o servidor.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.erro || "Erro ao conectar com o servidor.");
  }
  return data;
}

export const api = {
  cadastro: (payload) =>
    request("/cadastro", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload) =>
    request("/login", { method: "POST", body: JSON.stringify(payload) }),

  me: async () => {
    try {
      const response = await fetch(`${BASE_URL}/me`, { credentials: "include" });
      return await response.json();
    } catch {
      return { logado: false };
    }
  },

  logout: () => request("/logout", { method: "POST" }),

  contato: (payload) =>
    request("/contato", { method: "POST", body: JSON.stringify(payload) }),
};

// Hook simples: carrega dados, expõe loading/erro e refetch (pull-to-refresh).
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setData(await fn());
    } catch (e) {
      setError(e.message || "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}