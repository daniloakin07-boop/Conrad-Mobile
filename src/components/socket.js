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