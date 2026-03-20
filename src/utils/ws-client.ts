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
    const bytes = new Blob([event.data]).size;
    logger.ws("← payload size:", bytes, "bytes", `(${(bytes / 1024).toFixed(2)}kb)`);
    const data = JSON.parse(event.data);
    logger.ws("←", data.type, data);

    switch (data.type) {
      case "authResponse":
        if (data.success) {
          logger.ws("Auth successful");
        } else {
          logger.error("Auth failed:", data.message);
        }
        break;

      case "loginSuccess":
        logger.ws("Login success — id:", data.id);
        useGameStore.getState().setMyId(String(data.id));
        useGameStore.getState().setSession({
          sessionToken: data.sessionToken,
          sessionExpiresAt: data.sessionExpiresAt,
        });
        break;

      // TODO: Remove once server sends player_init/tick/player_leave protocol
      case "state": {
        const { indexRegistry } = useGameStore.getState();
        data.players.forEach((p: any) => {
          if (indexRegistry.has(p.id)) return; // already registered, tick will handle updates
          useGameStore.getState().registerPlayer({
            index: p.id,
            id: String(p.id),
            name: p.name ?? String(p.id),
            hp: p.hp ?? 100,
            maxHp: p.maxHp ?? 100,
            x: p.x,
            y: p.y,
          });
        });

        // Unregister players no longer in the state broadcast
        const incomingIds = new Set(data.players.map((p: any) => p.id));
        indexRegistry.forEach((_, index) => {
          if (!incomingIds.has(index)) useGameStore.getState().unregisterPlayer(index);
        });

        logger.ws("State (legacy) — players:", data.players.length);
        break;
      }

      case "player_init":
        logger.ws("Player init — index:", data.index, "id:", data.id);
        useGameStore.getState().registerPlayer(data);
        break;

      case "player_leave":
        logger.ws("Player left — index:", data.index);
        useGameStore.getState().unregisterPlayer(data.index);
        break;

      case "tick":
        useGameStore.getState().applyTick(data);
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
