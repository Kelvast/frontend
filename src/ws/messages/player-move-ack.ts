import type { PlayerMoveAckMessage } from "mmo-shared";
import { MSG } from "mmo-shared";
import { registerMessageHandler } from "../registry";
import { useGameStore } from "../../utils/game-store";
import { getContext, hasContext } from "../../game-client/context";

/*
 * PLAYER_MOVE_ACK — server has validated the move request and resolved a path.
 *
 * Two things happen:
 *   1. The store gets the authoritative destination so localPlayer.x/z stays
 *      in sync with the server (used by UI, camera, other systems).
 *   2. The Babylon animation starts immediately via PlayerManager.animatePath.
 *
 * Animation is driven here — not via a store subscription — so it fires exactly
 * once per ack with no risk of double-firing on unrelated state writes.
 */
registerMessageHandler<PlayerMoveAckMessage>(MSG.PLAYER_MOVE_ACK, (msg) => {
  // Update store with server-authoritative destination position.
  useGameStore.getState().onPlayerMoveAck(msg.path, msg.pace);

  // Drive the Babylon animation directly.
  if (!hasContext()) return;
  getContext().players.animatePath(msg.path, msg.pace);
});
