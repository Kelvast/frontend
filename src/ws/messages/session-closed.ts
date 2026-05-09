import { MSG, type SessionClosedMessage } from "kelvast-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

/*
 * Handles SESSION_CLOSED (103) - server confirmation of a clean session end.
 *
 * Received after the server has persisted player state, broadcast
 * PlayerLeaveMessage to nearby players, and removed the player from the world.
 *
 * Calls onLogout which clears all identity, session, and game state from
 * the store, then redirects to /login.
 *
 * Note: the client also sends SESSION_CLOSED to initiate logout. This handler
 * only fires on the server's confirmation response - not on the outbound send.
 */
function handleSessionClosed(_msg: SessionClosedMessage): void {
  logger.ws("Session closed by server");
  void useGameStore.getState().onLogout();
}

registerMessageHandler<SessionClosedMessage>(MSG.SESSION_CLOSED, handleSessionClosed);
