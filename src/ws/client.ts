"use client";

import type { ClientMessage, MessageBase, MessageType } from "kelvast-shared";
import { MSG } from "kelvast-shared";
import { useGameStore } from "../utils/game-store";
import { logger } from "../utils/logger";
import { dispatch } from "./registry";

let ws: WebSocket | null = null;

export function connectWS(token?: string): void {
  if (ws) return;

  const url = process.env.NEXT_PUBLIC_MMO_SERVER_URL ?? "ws://localhost:8080";
  logger.ws("▶ connecting to", url);
  ws = new WebSocket(url);

  ws.onopen = () => {
    logger.ws("✓ connected");
    useGameStore.getState().setConnected(true);

    if (token) {
      logger.ws("▶ sending SESSION_RESUME");
      send({ type: MSG.SESSION_RESUME, token });
    } else {
      logger.warn("connectWS: no token — SESSION_RESUME not sent");
    }
  };

  ws.onmessage = (event: MessageEvent) => {
    const msg = JSON.parse(event.data as string) as { type: MessageType };

    if (msg.type !== MSG.TICK) {
      const bytes = new Blob([event.data]).size;
      logger.ws("←", msg.type, `(${bytes}b / ${(bytes / 1024).toFixed(2)}kb)`, msg);
    }

    dispatch(msg);
  };

  ws.onclose = () => {
    logger.ws("✗ disconnected");
    useGameStore.getState().setConnected(false);
    ws = null;
  };

  ws.onerror = (error) => {
    logger.error("WS error:", error);
  };
}

export function disconnect(): void {
  logger.ws("▶ disconnect");
  ws?.close();
  ws = null;
}

export function send(message: ClientMessage): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    logger.warn("send: WS not open — packet dropped:", message.type);
  }
}
