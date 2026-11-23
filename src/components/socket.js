// ============================================================================
// src/components/socket.js — conexão Socket.IO do bate-papo
// O servidor (JS/chat.js) identifica o usuário pela SESSÃO (cookie), nunca por dados
// enviados pelo cliente; conexões sem sessão são encerradas. Eventos usados pelo app:
//   emit "chat:entrar"  { turmaId, participanteId } → ack { ok, conversa, mensagens }
//   emit "chat:enviar"  { tipo, conteudo, nomeArquivo } → ack { ok, id }
//   on   "chat:mensagem" nova mensagem da conversa
// Usado por app/conversa.js.
// ============================================================================
import { io } from "socket.io-client";
import { BASE_URL } from "../api";

// O Socket.IO do servidor autentica pela sessão (cookie). Começamos por polling
// (usa o mesmo cookie jar nativo do fetch) e depois sobe para websocket.
export function conectarChat() {
  return io(BASE_URL, {
    transports: ["polling", "websocket"],
    withCredentials: true,
    reconnection: true,
  });
}