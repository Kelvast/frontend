import { Scene } from "@babylonjs/core";
import { createScene } from "./world";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const scene = createScene(canvas);

let socket: WebSocket | null = null;

function connectWebSocket() {
  socket = new WebSocket("ws://localhost:8080");

  socket.onopen = () => {
    console.log("Connected to server");
    socket?.send(JSON.stringify({ type: "login", name: "Sam", pass: "demo" }));
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "state") {
      handleStateMessage(message.players);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Disconnected from server");
    setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
  };
}

function handleStateMessage(
  players: {
    id: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    pathLen: number;
    hp: number;
    facing: number;
  }[],
) {
  console.log("Received state update:", players);
  // Update player positions here
}

connectWebSocket();
