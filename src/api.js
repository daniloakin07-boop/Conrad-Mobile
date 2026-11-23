// ============================================================================
// src/api.js — comunicação do app Mobile com o back-end do CONRAD Web
// ----------------------------------------------------------------------------
// O app NÃO tem servidor próprio: usa o MESMO Express/PostgreSQL da versão Web
// (JS/server.js, turmas.js, atividades.js, medias.js e chat.js).
// Este arquivo concentra:
//   1) BASE_URL      → endereço do servidor (dev local, emulador ou produção);
//   2) request()     → "fetch" com cookie de sessão, timeout e erros padronizados;
//   3) api           → um método por rota REAL do servidor (nenhuma regra de
//                      negócio é reimplementada aqui);
//   4) useApi()      → hook que carrega dados, expõe loading/erro e "reload".
// Usado por: praticamente todas as telas em app/ e por src/components/socket.js.
// ============================================================================
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Endereço do servidor
// ---------------------------------------------------------------------------
// Ordem de prioridade (a primeira que existir vence):
//   1. EXPO_PUBLIC_API_URL    → variável de ambiente (ex.: emulador Android usa
//                               http://10.0.2.2:3000);
//   2. extra.apiUrl           → campo do app.json (sem editar código);
//   3. desenvolvimento (__DEV__) → IP da máquina que serve o bundle do Expo, porta 3000
//                               (funciona em celular físico na mesma rede Wi-Fi);
//   4. produção               → PROD_URL, a mesma usada por JS/config.js e JS/auth.js do Web.
function resolverHostDeDesenvolvimento() {
  // hostUri tem o formato "192.168.0.10:8081": só o IP interessa (a API roda na 3000).
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || "";
  const host = hostUri.split(":")[0];
  return host && host.length > 0 ? host : "localhost";
}

// Endereço padrão do backend publicado. O app fica funcional em qualquer celular
// sem depender do IP ou da máquina Windows de quem desenvolveu.
const PROD_URL = "https://conrad.onrender.com";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  (__DEV__ ? `http://${resolverHostDeDesenvolvimento()}:3000` : PROD_URL);

// O Render (plano gratuito) "dorme" e pode levar cerca de 1 minuto para acordar.
const TIMEOUT_MS = 60000;

// ---------------------------------------------------------------------------
// Sessão expirada
// ---------------------------------------------------------------------------
// O AuthContext registra aqui uma função; quando uma rota protegida responde 401
// (cookie de 1 h expirou), ela limpa o usuário e o app volta para o login.
let aoNaoAutorizado = null;
export function setUnauthorizedHandler(fn) {
  aoNaoAutorizado = fn;
}

// ---------------------------------------------------------------------------
// request(): chamada HTTP padrão
// ---------------------------------------------------------------------------
// @param {string} caminho  rota do servidor, ex.: "/api/turmas"
// @param {object} opcoes   opções do fetch (method, body, headers)
// @returns {Promise<object>} JSON da resposta (lança Error com .status se não for 2xx)
// - "credentials: include" envia/recebe o cookie de sessão "conrad.sid".
// - /login e /cadastro respondem 401/409 com mensagem própria: NÃO derrubam a sessão.
async function request(caminho, opcoes = {}) {
  const { headers, ...resto } = opcoes;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${caminho}`, {
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

  // Respostas sem corpo JSON viram {} em vez de estourar.
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const rotaDeAuth = caminho === "/login" || caminho === "/cadastro";
    if (response.status === 401 && !rotaDeAuth && aoNaoAutorizado) aoNaoAutorizado();
    const erro = new Error(data.erro || "Erro ao conectar com o servidor.");
    erro.status = response.status;
    throw erro;
  }
  return data;
}

// Atalho para montar { method, body } com JSON.
const json = (method, body) => ({ method, body: JSON.stringify(body ?? {}) });

// Monta "?a=1&b=2" ignorando valores vazios (filtros opcionais).
const query = (params = {}) => {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
};

// ---------------------------------------------------------------------------
// api: um método por rota existente no servidor (conferidas uma a uma)
// ---------------------------------------------------------------------------
export const api = {
  // --- conta e sessão (JS/server.js) ---
  cadastro: (payload) => request("/cadastro", json("POST", payload)),
  login: (payload) => request("/login", json("POST", payload)),
  // /me não passa por request(): sem sessão é um resultado normal ({ logado: false }), não um erro.
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

  // --- turmas (JS/turmas.js) ---
  turmas: () => request("/api/turmas"),
  turma: (id) => request(`/api/turmas/${id}`),
  criarTurma: (payload) => request("/api/turmas", json("POST", payload)),
  entrarTurma: (codigo) => request("/api/turmas/entrar", json("POST", { codigo })),
  removerAluno: (turmaId, alunoId) =>
    request(`/api/turmas/${turmaId}/alunos/${alunoId}`, { method: "DELETE" }),

  // --- atividades e avaliações (JS/atividades.js) ---
  // Educador: lista as que ele criou (filtros opcionais: turmaId e tipo).
  atividadesEducador: (filtros) => request(`/api/atividades${query(filtros)}`),
  // Envia { titulo, turma_id, data_aplicacao, valor_maximo, descricao, tipo }.
  // O servidor ignora qualquer outro campo (não há "questões" nesta versão do back-end).
  criarAtividade: (payload) => request("/api/atividades", json("POST", payload)),
  entregas: (id) => request(`/api/atividades/${id}/entregas`),
  corrigir: (entregaId, corpo) => request(`/api/entregas/${entregaId}/correcao`, json("PUT", corpo)),
  // Aluno: atividades das turmas em que está matriculado, já com entrega, nota e feedback.
  atividadesAluno: (filtros) => request(`/api/aluno/atividades${query(filtros)}`),
  enviarEntrega: (id, corpo) => request(`/api/atividades/${id}/entrega`, json("POST", corpo)),

  // --- boletim (JS/medias.js) ---
  boletim: () => request("/api/boletim"),

  // --- bate-papo (JS/chat.js; o tempo real usa Socket.IO em src/components/socket.js) ---
  chatContatos: () => request("/api/chat/contatos"),
};

// ---------------------------------------------------------------------------
// useApi(fn, deps): hook de carregamento
// ---------------------------------------------------------------------------
// @param {Function} fn    função assíncrona que devolve os dados (ex.: () => api.turmas())
// @param {Array}    deps  quando mudam, os dados são recarregados
// @returns {{data, loading, error, reload}}  "reload" serve ao pull-to-refresh.
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
