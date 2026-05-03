import { MSG, type PlayerDataMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";

/*
 * PLAYER_DATA (200) — carries skills, inventory, equipment.
 * The loader is already dismissed by index.ts before this arrives.
 *
 * TODO: wire to useGameStore.getState().onPlayerData(msg)
 */
function handlePlayerData(_msg: PlayerDataMessage): void {
  logger.ws("✓ PLAYER_DATA received");
  // TODO: useGameStore.getState().onPlayerData(_msg);
}

registerMessageHandler<PlayerDataMessage>(MSG.PLAYER_DATA, handlePlayerData);
