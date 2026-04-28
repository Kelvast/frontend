"use client";

import { useGameStore } from "./game-store";
import { logger } from "./logger";
import { DEV_MODE, getDevCredentials } from "./dev";
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

    const dev = getDevCredentials();
    if (dev) {
      logger.ws("Dev mode - auto-login as", dev.email);
      ws!.send(JSON.stringify({ type: "login", email: dev.email, pass: dev.password }));
    } else if (token) {
      logger.ws("Resuming session with token");
      ws!.send(JSON.stringify({ type: "resume", token }));
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
        // Covers login, resume, and register (server auto-logs in on register).
        // hydrateLocalPlayer overlays the authoritative spawn position onto the
        // base player state already set by setLocalPlayer at HTTP login.
        // setSession stores the gameSessionToken for future WS resume.
        store.hydrateLocalPlayer(data);
        store.setSession({
          gameSessionToken: data.gameSessionToken,
          gameSessionExpiresAt: data.gameSessionExpiresAt,
        });
        break;

      case "auth_fail":
        // In dev mode, auth failure on login means the account doesn't exist
        // yet - auto-register so the dev loop stays frictionless.
        if (DEV_MODE) {
          const dev = getDevCredentials()!;
          logger.ws("Dev mode - account not found, auto-registering");
          ws!.send(
            JSON.stringify({
              type: "register",
              name: "DevPlayer",
              email: dev.email,
              pass: dev.password,
            }),
          );
        } else {
          logger.error("Auth failed:", data.message);
        }
        break;

      case "world_state":
        // Initial snapshot of all players in range sent right after login.
        for (const snapshot of data.players) {
          store.registerPlayer({ type: "player_join", player: snapshot });
        }
        break;

      case "player_join":
        logger.ws("Player joined - id:", data.player.id, "name:", data.player.name);
        store.registerPlayer(data);
        break;

      case "player_leave":
        logger.ws("Player left - id:", data.id);
        store.unregisterPlayer(data.id);
        break;

      case "player_stopped":
        // Authoritative position correction after movement ends.
        // Wrapped as a single-entry deltas array to reuse applyTick's
        // Map-based patch logic without a separate code path.
        store.applyTick({
          type: "tick",
          timestamp: Date.now(),
          deltas: [{ id: data.id, x: data.x, y: data.y, z: data.z, facing: data.facing, pace: data.pace }],
        });
        break;

      case "pong":
        store.setLatency(Date.now() - data.t);
        break;

      case "tick":
        store.applyTick(data);
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
