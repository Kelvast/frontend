import { MSG, type PlayerDataMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";
import { useGameStore } from "../../utils/game-store";

/*
 * PLAYER_DATA (200) — carries skills, inventory, equipment.
 * The loader is already dismissed by index.ts before this arrives.
 *
 * TODO: wire to useGameStore.getState().onPlayerData(msg)
 */
function handlePlayerData(msg: PlayerDataMessage): void {
  logger.ws("player_data received");
  useGameStore.getState().onPlayerData(msg);
}

registerMessageHandler<PlayerDataMessage>(MSG.PLAYER_DATA, handlePlayerData);
