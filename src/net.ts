import type { ServerPlayer } from "./types";

let socket: WebSocket | null = null;

export function connectWebSocket(): WebSocket {
  if (socket?.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket("ws://localhost:8080");

  socket.onopen = () => {
    console.log("✅ Connected to MMO server");
    socket?.send(JSON.stringify({ type: "login", name: "Sam", pass: "demo" }));
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as { type: string; players?: ServerPlayer[] };
    if (message.type === "state" && message.players) {
      // Broadcast to subscribers (players.ts will listen)
      window.dispatchEvent(
        new CustomEvent("serverState", {
          detail: message.players as ServerPlayer[],
        }),
      );
    }
  };

  socket.onerror = (error) => console.error("WebSocket error:", error);
  socket.onclose = () => {
    console.log("Disconnected, reconnecting...");
    setTimeout(connectWebSocket, 1000);
  };

  return socket;
}

// Auto-connect when this module loads
connectWebSocket();
