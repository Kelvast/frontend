import type { PlayerMoveAckMessage } from "mmo-shared";
import { MSG } from "mmo-shared";
import { registerMessageHandler } from "../registry";
import type { PlayerManager } from "../../game-client/entities/players";

let players: PlayerManager | null = null;

export function initPlayerMoveAck(pm: PlayerManager): void {
  players = pm;
}

registerMessageHandler<PlayerMoveAckMessage>(MSG.PLAYER_MOVE_ACK, (msg) => {
  if (!players) return;
  players.animatePath(msg.path, msg.pace);
});
