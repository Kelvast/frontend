import type { ServerPlayer } from "./types";
import { setMyId, syncPlayers, getLastTile } from "./store";

const SERVER_URL = import.meta.env.VITE_MMO_SERVER ?? "ws://localhost:8080";

let socket: WebSocket | null = null;
let hasConnected = false;

export function connectWebSocket(): WebSocket {
  if (socket?.readyState === WebSocket.OPEN) return socket;
  if (socket?.readyState === WebSocket.CONNECTING) return socket;

  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    if (hasConnected) return;
    hasConnected = true;
    console.log(`✅ Connected (${SERVER_URL})`);

    const lastTile = getLastTile();

    // Send last known position so server spawns player there
    socket?.send(JSON.stringify({
      type: "login",
      name: "Sam",
      pass: "demo",
      ...(lastTile && { spawnX: lastTile.x, spawnZ: lastTile.z })
    }));
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "loginSuccess") {
      setMyId(msg.id);
      window.dispatchEvent(new CustomEvent("loginSuccess", { detail: msg.id }));
    }

    if (msg.type === "state" && msg.players) {
      syncPlayers(msg.players as ServerPlayer[]);
      window.dispatchEvent(new Event("stateUpdated"));
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
