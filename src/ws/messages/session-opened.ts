import { MSG, type SessionOpenedMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

/*
 * Handles SESSION_OPENED (101).
 *
 * First message of the two-message handshake that fully hydrates the client.
 * Carries PlayerPresence (id, uuid, playerName, x, y, z, facing) and worldName.
 * Position here is always authoritative and overrides any cached value.
 *
 * PlayerDataMessage follows immediately after - the client is not fully
 * hydrated until both messages are received.
 */
function handleSessionOpened(msg: SessionOpenedMessage): void {
  logger.ws("Session opened - world:", msg.worldName, "id:", msg.id);
  useGameStore.getState().onLoginSuccess(msg);
}

registerMessageHandler<SessionOpenedMessage>(MSG.SESSION_OPENED, handleSessionOpened);
