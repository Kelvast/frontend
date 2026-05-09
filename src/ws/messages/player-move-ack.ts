import type { PlayerMoveAckMessage } from "kelvast-shared";
import { MSG } from "kelvast-shared";
import { registerMessageHandler } from "../registry";
import { useGameStore } from "../../utils/game-store";

registerMessageHandler<PlayerMoveAckMessage>(MSG.PLAYER_MOVE_ACK, (msg) => {
  useGameStore.getState().onPlayerMoveAck(msg.path, msg.pace);
});
