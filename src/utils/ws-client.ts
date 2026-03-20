"use client";

import { useGameStore } from "./game-store";
import { logger } from "./logger";
import { DEV_MODE, getDevCredentials } from "./dev";
import { UserSettings } from "../types/mmo/settings";

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

    if (data.type !== "tick") {
      const bytes = new Blob([event.data]).size;
      logger.ws("← payload size:", bytes, "bytes", `(${(bytes / 1024).toFixed(2)}kb)`);
      logger.ws("←", data.type, data);
    }

    switch (data.type) {
      case "login_success":
        logger.ws("Login success — index:", data.index, "id:", data.id);
        useGameStore.getState().hydrateLocalPlayer(data);
        useGameStore.getState().setSession({
          sessionToken: data.sessionToken,
          sessionExpiresAt: data.sessionExpiresAt,
        });
        break;

      case "auth_fail":
        if (DEV_MODE) {
          const dev = getDevCredentials()!;
          logger.ws("Dev mode — account not found, auto-registering");
          ws!.send(
            JSON.stringify({
              type: "register",
              name: "DevPlayer",
              email: dev.email,
              password: dev.password,
            }),
          );
        } else {
          logger.error("Auth failed:", data.message);
        }
        break;

      case "register_success":
        if (DEV_MODE) {
          const dev = getDevCredentials()!;
          logger.ws("Dev mode — registered, logging in");
          ws!.send(JSON.stringify({ type: "login", email: dev.email, password: dev.password }));
        }
        break;

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

export const sendPlayerMove = (x: number, y: number, z: number, facing: number) => {
  if (ws?.readyState === WebSocket.OPEN) {
    logger.ws("→ player_move", { x, y, z, facing });
    ws.send(JSON.stringify({ type: "player_move", x, y, z, facing }));
  } else {
    logger.warn("sendPlayerMove called but WS not open");
  }
};

export const sendSettings = (settings: UserSettings): void => {
  if (ws?.readyState === WebSocket.OPEN) {
    logger.ws("→ save_settings", settings);
    ws.send(JSON.stringify({ type: "save_settings", settings }));
  }
};
