import { MSG, type SessionOpenedMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * SESSION_OPENED (101) — server has accepted the token and placed the
 * player in the world. Advances the loader to "session".
 *
 * "connected" is NOT fired here. See index.ts — it fires after bootGame
 * completes so the loader dismisses onto a rendered scene.
 */
let onLoadEvent: OnLoadEvent | null = null;

export function setLoadEventCallback(cb: OnLoadEvent): void {
  onLoadEvent = cb;
}

function handleSessionOpened(msg: SessionOpenedMessage): void {
  logger.ws("✓ SESSION_OPENED — world:", msg.worldName, "player id:", msg.id);
  useGameStore.getState().onLoginSuccess(msg);
  onLoadEvent?.({ stage: "session", detail: `World: ${msg.worldName} · player id: ${msg.id}` });
  onLoadEvent = null;
}

registerMessageHandler<SessionOpenedMessage>(MSG.SESSION_OPENED, handleSessionOpened);
