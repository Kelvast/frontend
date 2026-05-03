import { MSG, type SessionOpenedMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * SESSION_OPENED (101) — server has accepted the token and placed the
 * player in the world. Advances the loader to the "session" stage so
 * the user sees progress, then hydrates the store.
 *
 * "connected" is NOT fired here. The loader should only dismiss once
 * bootGame has fully completed (engine + world + systems ready) so the
 * player sees the rendered scene, not a black canvas. index.ts fires
 * "connected" after Promise.all([connectWS, bootGame]) resolves.
 */
let onLoadEvent: OnLoadEvent | null = null;

export function setLoadEventCallback(cb: OnLoadEvent): void {
  onLoadEvent = cb;
}

function handleSessionOpened(msg: SessionOpenedMessage): void {
  logger.ws("Session opened — world:", msg.worldName, "id:", msg.id);
  useGameStore.getState().onLoginSuccess(msg);
  onLoadEvent?.({ stage: "session", detail: `World: ${msg.worldName} · player id: ${msg.id}` });
  onLoadEvent = null;
}

registerMessageHandler<SessionOpenedMessage>(MSG.SESSION_OPENED, handleSessionOpened);
