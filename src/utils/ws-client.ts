"use client";

import { useGameStore } from "./game-store";
import { logger } from "./logger";
import type { UserSettings } from "../types/mmo/settings";

let ws: WebSocket | null = null;

export const connectWS = (token?: string) => {
  if (ws) return;

  const url = process.env.NEXT_PUBLIC_MMO_SERVER_URL ?? "ws://localhost:8080";
  logger.ws("Connecting to", url);
  ws = new WebSocket(url);

  ws.onopen = () => {
    logger.ws("Connected");
    useGameStore.getState().setConnected(true);

    if (token) {
      logger.ws("Resuming session with token");
      ws!.send(JSON.stringify({ type: "resume", token }));
    } else {
      logger.warn("connectWS called without a token - no resume packet sent");
    }
  };

  ws.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data as string);

    if (data.type !== "tick") {
      const bytes = new Blob([event.data]).size;
      logger.ws("\u2190 payload size:", bytes, "bytes", `(${(bytes / 1024).toFixed(2)}kb)`);
      logger.ws("\u2190", data.type, data);
    }

    const store = useGameStore.getState();

    switch (data.type) {
      case "login_success":
        store.onLoginSuccess(data);
        break;

      case "auth_fail":
        logger.error("Auth failed:", data.message);
        break;

      case "world_state":
        store.onWorldState(data);
        break;

      case "player_join":
        logger.ws("Player joined - id:", data.player.id, "name:", data.player.playerName);
        store.onPlayerJoin(data);
        break;

      case "player_leave":
        logger.ws("Player left - id:", data.id);
        store.onPlayerLeave(data);
        break;

      case "player_stopped":
        store.onPlayerStopped(data);
        break;

      case "pong":
        store.setLatency(Date.now() - data.t);
        break;

      case "tick":
        store.onTick(data);
        break;

      case "logout_success":
        logger.ws("Logged out");
        break;

      case "error":
        logger.error("Server error:", data.message);
        break;

      default:
        logger.warn("Unhandled WS message type:", (data as { type: string }).type);
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

export const sendPlayerMove = (x: number, y: number, z: number, pace: number): void => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "move", x, y, z, pace }));
  } else {
    logger.warn("sendPlayerMove called but WS not open");
  }
};

export const sendPing = (): void => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "ping", t: Date.now() }));
  }
};

export const sendSettings = (settings: UserSettings): void => {
  if (ws?.readyState === WebSocket.OPEN) {
    logger.ws("\u2192 save_settings", settings);
    ws.send(JSON.stringify({ type: "save_settings", settings }));
  }
};
