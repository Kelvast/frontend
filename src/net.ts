import type { ServerPlayer } from "./types";
import { setMyId, syncPlayers } from "./store";
import { showLoginScreen, hideLoginScreen } from "./login";

const SERVER_URL = import.meta.env.VITE_MMO_SERVER ?? "ws://localhost:8080";

let socket: WebSocket | null = null;

function getSavedSession(): { token: string; expiresAt: number } | null {
  const stored = localStorage.getItem("mmo_session");
  if (!stored) return null;
  const session = JSON.parse(stored);
  if (session.expiresAt < Date.now()) {
    localStorage.removeItem("mmo_session");
    return null;
  }
  return session;
}

export function logout() {
  localStorage.removeItem("mmo_session");
  socket?.close();
  window.location.reload();
}

export async function connectWebSocket(): Promise<WebSocket> {
  if (socket?.readyState === WebSocket.OPEN) return socket;
  if (socket?.readyState === WebSocket.CONNECTING) return socket!;

  socket = new WebSocket(SERVER_URL);

  await new Promise<void>((resolve) => {
    socket!.onopen = () => {
      console.log(`✅ Connected (${SERVER_URL})`);
      resolve();
    };
  });

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "loginSuccess") {
      if (msg.sessionToken) {
        localStorage.setItem("mmo_session", JSON.stringify({
          token: msg.sessionToken,
          expiresAt: msg.sessionExpiresAt,
        }));
      }
      setMyId(msg.id);
      hideLoginScreen();
      window.dispatchEvent(new CustomEvent("loginSuccess", { detail: msg.id }));
      console.log(`✅ Logged in (id: ${msg.id})`);
    }

    if (msg.type === "authResponse" && !msg.success) {
      console.warn(`❌ Auth failed: ${msg.message}`);
      localStorage.removeItem("mmo_session");
      window.dispatchEvent(new CustomEvent("authFailed", { detail: msg.message }));
    }

    if (msg.type === "state" && msg.players) {
      syncPlayers(msg.players as ServerPlayer[]);
      window.dispatchEvent(new Event("stateUpdated"));
    }

    if (msg.type === "error") {
      console.error("Server error:", msg.message);
    }
  };

  socket.onerror = (e) => console.error("❌ WebSocket error:", e);
  socket.onclose = () => {
    console.log("🔌 Disconnected, reconnecting...");
    socket = null;
    setTimeout(connectWebSocket, 1000);
  };

  const session = getSavedSession();
  if (session) {
    console.log("🔄 Resuming session...");
    socket.send(JSON.stringify({ type: "resume", token: session.token }));
  } else {
    const { email, pass } = await showLoginScreen();
    console.log(`🔐 Attempting login as ${email}`);
    socket.send(JSON.stringify({ type: "login", email, pass }));
  }

  return socket;
}

