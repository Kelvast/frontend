"use client";

import { useGameStore } from "./game-store";
import { logger } from "./logger";
import { getDevCredentials } from "./dev";

let ws: WebSocket | null = null;

export const connectWS = (token?: string) => {
  if (ws) return;

  const url = process.env.NEXT_PUBLIC_MMO_SERVER_URL ?? "ws://localhost:8080";
  logger.ws("Connecting to", url);
  ws = new WebSocket(url);

  ws.onopen = () => {
    logger.ws("Connected");
    useGameStore.getState().setConnected(true);

    const dev = getDevCredentials();
    if (dev) {
      logger.ws("Dev mode — auto-login as", dev.email);
      ws!.send(JSON.stringify({ type: "login", email: dev.email, password: dev.password }));
    } else if (token) {
      logger.ws("Resuming session with token");
      ws!.send(JSON.stringify({ type: "resume", token }));
    }
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    logger.ws("←", data.type, data);

    switch (data.type) {
      case "init":
        logger.ws("Init — myId:", data.id, "players:", data.players?.length);
        useGameStore.getState().setMyId(data.id);
        useGameStore.getState().setNearbyPlayers(data.players);
        break;

      case "player_update": {
        const current = useGameStore.getState().nearbyPlayers;
        useGameStore
          .getState()
          .setNearbyPlayers(
            current.map((p) => (p.id === data.playerId ? { ...p, position: data.position } : p)),
          );
        break;
      }

      case "player_join":
        logger.ws("Player joined:", data.player?.id);
        useGameStore.getState().addNearbyPlayer(data.player);
        break;

      case "player_leave":
        logger.ws("Player left:", data.playerId);
        useGameStore.getState().removeNearbyPlayer(data.playerId);
        break;

      default:
        logger.warn("Unhandled WS message type:", data.type);
    }
  };

  ws.onclose = () => {
    logger.ws("Disconnected");
    useGameStore.getState().setConnected(false);
    ws = null;
  };

  ws.onerror = (error) => {
    logger.error("WebSocket error", error);
  };
};

export const sendPlayerUpdate = (position: { x: number; y: number; z: number }) => {
  if (ws?.readyState === WebSocket.OPEN) {
    logger.ws("→ player_move", position);
    ws.send(JSON.stringify({ type: "player_move", position }));
  } else {
    logger.warn("sendPlayerUpdate called but WS not open");
  }
};
