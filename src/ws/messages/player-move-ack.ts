import type { PlayerMoveAckMessage } from "mmo-shared";
import type { PlayerManager } from "../../game-client/entities/players";

/*
 * Handles PLAYER_MOVE_ACK from the server.
 * The server has run pathfinding and returned the full authoritative path.
 * We hand it directly to PlayerManager to animate — nothing else happens here.
 */
export function handlePlayerMoveAck(msg: PlayerMoveAckMessage, players: PlayerManager): void {
  players.animatePath(msg.path, msg.pace);
}
