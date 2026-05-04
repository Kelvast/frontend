import type { MoveMessage } from "mmo-shared";
import { MSG } from "mmo-shared";
import { send } from "../client";

/*
 * Sends a movement request to the server with the destination tile only.
 * The server runs pathfinding and responds with PLAYER_MOVE_ACK containing
 * the full authoritative path.
 */
export function sendPlayerMove(destX: number, destZ: number): void {
  const packet: MoveMessage = { type: MSG.PLAYER_MOVE, x: destX, z: destZ };
  send(packet);
}
