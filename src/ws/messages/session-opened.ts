import { MSG, type SessionOpenedMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * SESSION_OPENED (101) — server has accepted the token and the player
 * is live in the world. This is the signal that the client is fully
 * ready to play.
 *
 * Fires "player_data" then "connected" so the loader advances through
 * its final two stages and dismisses. We do not wait for the WS
 * player_data message (200) to dismiss the loader — that message is
 * a data hydration event and may arrive after the player is already
 * in a playable state. When the server sends player_data (skills,
 * inventory etc.) the handler in player-data.ts will update the store.
 */
let onLoadEvent: OnLoadEvent | null = null;

export function setLoadEventCallback(cb: OnLoadEvent): void {
  onLoadEvent = cb;
}

function handleSessionOpened(msg: SessionOpenedMessage): void {
  logger.ws("Session opened — world:", msg.worldName, "id:", msg.id);
  useGameStore.getState().onLoginSuccess(msg);
  onLoadEvent?.({ stage: "player_data", detail: `World: ${msg.worldName}` });
  onLoadEvent?.({ stage: "connected" });
  onLoadEvent = null;
}

registerMessageHandler<SessionOpenedMessage>(MSG.SESSION_OPENED, handleSessionOpened);
