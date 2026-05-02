"use client";

import type { ClientPacket } from "mmo-shared";
import type { LocalClientPacket } from "./types";
import { useGameStore } from "../utils/game-store";
import { logger } from "../utils/logger";
import { dispatch } from "./registry";

let ws: WebSocket | null = null;

export function connectWS(token?: string): void {
  if (ws) return;

  const url = process.env.NEXT_PUBLIC_MMO_SERVER_URL ?? "ws://localhost:8080";
  logger.ws("Connecting to", url);
  ws = new WebSocket(url);

  ws.onopen = () => {
    logger.ws("Connected");
    useGameStore.getState().setConnected(true);

    if (token) {
      logger.ws("Resuming session with token");
      send({ type: "resume", token });
    } else {
      logger.warn("connectWS called without a token - no resume packet sent");
    }
  };

  ws.onmessage = (event: MessageEvent) => {
    const msg = JSON.parse(event.data as string) as { type: string };

    if (msg.type !== "tick") {
      const bytes = new Blob([event.data]).size;
      logger.ws("←", msg.type, `(${bytes}b / ${(bytes / 1024).toFixed(2)}kb)`, msg);
    }

    dispatch(msg);
  };

  ws.onclose = () => {
    logger.ws("Disconnected");
    useGameStore.getState().setConnected(false);
    ws = null;
  };

  ws.onerror = (error) => {
    logger.error("WebSocket error", error);
  };
}

export function disconnect(): void {
  ws?.close();
  ws = null;
}

/*
 * Single send path for all outbound packets.
 * Accepts both shared ClientPacket and local-only packet types.
 * Dropped packets are warned — never silently lost.
 */
export function send(packet: ClientPacket | LocalClientPacket): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(packet));
  } else {
    logger.warn("send called but WS not open - packet dropped:", packet.type);
  }
}
