import type { PlayerLeaveMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handlePlayerLeave(msg: PlayerLeaveMessage): void {
  logger.ws("Player left - id:", msg.id);
  useGameStore.getState().onPlayerLeave(msg);
}

registerMessageHandler<PlayerLeaveMessage>("player_leave", handlePlayerLeave);
