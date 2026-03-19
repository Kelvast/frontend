import type { ServerPlayer } from "./types";
import { setMyId, syncPlayers } from "./store";

const SERVER_URL = import.meta.env.VITE_MMO_SERVER ?? "ws://localhost:8080";

let socket: WebSocket | null = null;
let hasConnected = false;

function getCredentials(): { name: string; pass: string } {
  const stored = localStorage.getItem("mmo_credentials");
  if (stored) return JSON.parse(stored);

  // First time — prompt for name
  const name = prompt("Enter your username:") || `Player${Math.floor(Math.random() * 9999)}`;
  const credentials = { name, pass: "demo" }; // Pass is placeholder until real auth
  localStorage.setItem("mmo_credentials", JSON.stringify(credentials));
  return credentials;
}

export function logout() {
  localStorage.removeItem("mmo_credentials");
  socket?.close();
  window.location.reload();
}

export function connectWebSocket(): WebSocket {
  if (socket?.readyState === WebSocket.OPEN) return socket;
  if (socket?.readyState === WebSocket.CONNECTING) return socket;

  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    if (hasConnected) return;
    hasConnected = true;
    console.log(`✅ Connected (${SERVER_URL})`);

    const { name, pass } = getCredentials();
    socket?.send(JSON.stringify({ type: "login", name, pass }));
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "loginSuccess") {
      setMyId(msg.id);
      window.dispatchEvent(new CustomEvent("loginSuccess", { detail: msg.id }));
      console.log(`Logged in as: ${getCredentials().name}`);
    }

    if (msg.type === "state" && msg.players) {
      syncPlayers(msg.players as ServerPlayer[]);
      window.dispatchEvent(new Event("stateUpdated"));
    }

    if (msg.type === "error") {
      console.error("Server error:", msg.message);
    }
  };

  socket.onerror = (e) => console.error("WebSocket error:", e);
  socket.onclose = () => {
    console.log("Disconnected, reconnecting...");
    hasConnected = false;
    setTimeout(connectWebSocket, 1000);
  };

  return socket;
}
