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
    const message = JSON.parse(event.data);
    if (message.type === "loginSuccess") {
      window.dispatchEvent(new CustomEvent("loginSuccess", { detail: message.id }));
    }
    if (message.type === "state" && message.players) {
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

connectWebSocket();
