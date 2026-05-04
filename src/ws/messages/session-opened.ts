import { MSG, type SessionOpenedMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

/*
 * SESSION_OPENED (101) — server has accepted the token and placed the
 * player in the world.
 *
 * This handler only hydrates the store. It does NOT touch loader state.
 *
 * Loader stages are driven exclusively by index.ts and init.ts in a
 * strict sequential order. The WS handshake runs in parallel with engine
 * boot, so any loader event fired here could arrive while the loader is
 * already at a later stage — causing the bar to jump backwards.
 */
function handleSessionOpened(msg: SessionOpenedMessage): void {
  logger.ws("✓ SESSION_OPENED — world:", msg.worldName, "player id:", msg.id);
  useGameStore.getState().onLoginSuccess(msg);
}

registerMessageHandler<SessionOpenedMessage>(MSG.SESSION_OPENED, handleSessionOpened);
