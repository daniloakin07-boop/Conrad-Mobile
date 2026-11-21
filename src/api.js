import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Endereço do servidor (o MESMO back-end do CONRAD Web: JS/server.js)
// ---------------------------------------------------------------------------
// - Em desenvolvimento: detecta o IP da máquina que serve o bundle do Expo.
//   (emulador Android: defina EXPO_PUBLIC_API_URL=http://10.0.2.2:3000)
// - Em produção: mesma URL usada por JS/auth.js e JS/config.js do Web.
// - Pode ser sobrescrito sem editar código: EXPO_PUBLIC_API_URL ou
//   "extra.apiUrl" no app.json.
function resolveDevHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";
  const host = hostUri.split(":")[0];
  return host && host.length > 0 ? host : "localhost";
}

const PROD_URL = "https://conrad.onrender.com";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  (__DEV__ ? `http://${resolveDevHost()}:3000` : PROD_URL);

// O Render (plano gratuito) "dorme" e pode levar ~1 min para acordar.
const TIMEOUT_MS = 60000;

// Chamado quando uma rota protegida responde 401 (sessão expirada).
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, options = {}) {
  const { headers, ...resto } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(headers || {}) },
      ...resto,
    });
  } catch {
    throw new Error("Erro ao conectar com o servidor.");
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // /login e /cadastro respondem 401/409 com mensagem própria: não derrubam a sessão.
    const rotaDeAuth = path === "/login" || path === "/cadastro";
    if (response.status === 401 && !rotaDeAuth && onUnauthorized) onUnauthorized();
    const erro = new Error(data.erro || "Erro ao conectar com o servidor.");
    erro.status = response.status;
    throw erro;
  }
  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body ?? {}) });
const query = (params = {}) => {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
};

// Cada método espelha uma rota do server.js / turmas.js / atividades.js /
// medias.js / chat.js do Web. Nada aqui reimplementa regra de negócio.
export const api = {
  // --- conta e sessão (server.js) ---
  cadastro: (payload) => request("/cadastro", json("POST", payload)),
  login: (payload) => request("/login", json("POST", payload)),
  me: async () => {
    try {
      const response = await fetch(`${BASE_URL}/me`, { credentials: "include" });
      return await response.json();
    } catch {
      return { logado: false };
    }
  },
  logout: () => request("/logout", { method: "POST" }),
  contato: (payload) => request("/contato", json("POST", payload)),
  perfil: () => request("/perfil"),
  salvarPerfil: (payload) => request("/perfil", json("PUT", payload)),

  // --- turmas (turmas.js) ---
  turmas: () => request("/api/turmas"),
  turma: (id) => request(`/api/turmas/${id}`),
  criarTurma: (payload) => request("/api/turmas", json("POST", payload)),
  entrarTurma: (codigo) => request("/api/turmas/entrar", json("POST", { codigo })),
  removerAluno: (turmaId, alunoId) =>
    request(`/api/turmas/${turmaId}/alunos/${alunoId}`, { method: "DELETE" }),

  // --- atividades / avaliações (atividades.js) ---
  // educador: lista as suas (filtros opcionais turmaId e tipo)
  atividadesEducador: (filtros) => request(`/api/atividades${query(filtros)}`),
  criarAtividade: (payload) => request("/api/atividades", json("POST", payload)),
  entregas: (id) => request(`/api/atividades/${id}/entregas`),
  corrigir: (entregaId, corpo) => request(`/api/entregas/${entregaId}/correcao`, json("PUT", corpo)),
  // aluno
  atividadesAluno: (filtros) => request(`/api/aluno/atividades${query(filtros)}`),
  detalheAluno: (id) => request(`/api/aluno/atividades/${id}`),
  iniciarAtividade: (id) => request(`/api/atividades/${id}/iniciar`, { method: "POST" }),
  enviarEntrega: (id, corpo) => request(`/api/atividades/${id}/entrega`, json("POST", corpo)),

  // --- boletim (medias.js) ---
  boletim: () => request("/api/boletim"),

  // --- bate-papo (chat.js; o tempo real usa Socket.IO em components/socket.js) ---
  chatContatos: () => request("/api/chat/contatos"),
};

// Hook simples: carrega dados, expõe loading/erro e reload (pull-to-refresh).
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
