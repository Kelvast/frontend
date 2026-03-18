import type { ServerPlayer } from "./types";

const SERVER_URL = import.meta.env.VITE_MMO_SERVER ?? "ws://localhost:8080";

let socket: WebSocket | null = null;
let hasConnected = false; // Guard against HMR double-connect

export function connectWebSocket(): WebSocket {
  if (socket?.readyState === WebSocket.OPEN) return socket;
  if (socket?.readyState === WebSocket.CONNECTING) return socket;

  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    if (hasConnected) return; // HMR guard — never login twice
    hasConnected = true;
    console.log(`✅ Connected (${SERVER_URL})`);
    socket?.send(JSON.stringify({ type: "login", name: "Sam", pass: "demo" }));
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "loginSuccess") {
      window.dispatchEvent(new CustomEvent("loginSuccess", { detail: message.id }));
    }
    if (message.type === "state" && message.players) {
      window.dispatchEvent(new CustomEvent("serverState", {
        detail: message.players as ServerPlayer[],
      }));
    }
  };

  socket.onerror = (error) => console.error("WebSocket error:", error);
  socket.onclose = () => {
    console.log("Disconnected, reconnecting...");
    hasConnected = false; // Allow re-login on genuine reconnect
    setTimeout(connectWebSocket, 1000);
  };

  return socket;
}
