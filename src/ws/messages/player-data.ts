import { MSG, type PlayerDataMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";

/*
 * PLAYER_DATA (200) — carries skills, inventory, equipment.
 * The loader is already dismissed by session-opened.ts.
 * This handler is responsible only for hydrating the store once
 * the server implements and sends this message.
 *
 * TODO: wire to useGameStore.getState().onPlayerData(msg)
 */
function handlePlayerData(_msg: PlayerDataMessage): void {
  logger.ws("Player data received");
  // TODO: useGameStore.getState().onPlayerData(_msg);
}

registerMessageHandler<PlayerDataMessage>(MSG.PLAYER_DATA, handlePlayerData);
