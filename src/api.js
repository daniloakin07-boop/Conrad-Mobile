import Constants from "expo-constants";

// The web version picks its API host from window.location.hostname — that
// doesn't exist in React Native. In dev, Expo Go loads the JS bundle from
// your computer's LAN IP (shown in the terminal as exp://192.168.x.x:8081),
// so we reuse that same IP to reach the backend on port 3000. This means
// a physical phone on the same Wi-Fi as your computer works with zero
// manual config. Falls back to localhost for iOS Simulator / web.
function resolveDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    "";
  const host = hostUri.split(":")[0];
  return host && host.length > 0 ? host : "localhost";
}

// NOTE: Android emulators (not physical devices) can't reach the host
// machine via its LAN IP either — they need 10.0.2.2. Uncomment if you're
// testing on an emulator instead of a real device or iOS Simulator:
// import { Platform } from "react-native";
// const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : resolveDevHost();
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

  // /me returns 401 + {logado:false} when there's no session — that's an
  // expected state here, not an error, so this skips the throw-on-!ok path.
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
