import { MSG, type PlayerLeaveMessage } from "kelvast-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handlePlayerLeave(msg: PlayerLeaveMessage): void {
  logger.ws("Player left - id:", msg.id);
  useGameStore.getState().onPlayerLeave(msg);
}

registerMessageHandler<PlayerLeaveMessage>(MSG.PLAYER_LEAVE, handlePlayerLeave);
