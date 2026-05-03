import { MSG, type SessionOpenedMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * SESSION_OPENED (101) — first message of the two-message handshake.
 * Carries PlayerPresence + worldName. Fires onLoadEvent("session") so
 * the loader advances. player_data (200) follows immediately and fires
 * "connected" to dismiss the loader.
 */
let _onLoadEvent: OnLoadEvent | null = null;

export function setLoadEventCallback(cb: OnLoadEvent): void {
  _onLoadEvent = cb;
}

function handleSessionOpened(msg: SessionOpenedMessage): void {
  logger.ws("Session opened - world:", msg.worldName, "id:", msg.id);
  useGameStore.getState().onLoginSuccess(msg);
  _onLoadEvent?.({ stage: "session", detail: `World ${msg.worldName} · id ${msg.id}` });
}

registerMessageHandler<SessionOpenedMessage>(MSG.SESSION_OPENED, handleSessionOpened);
