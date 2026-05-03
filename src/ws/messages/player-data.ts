import { MSG, type PlayerDataMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";

// future: wire to store.onPlayerData(msg) once store action exists
function handlePlayerData(_msg: PlayerDataMessage): void {
  logger.ws("player_data received - handler not yet wired");
}

registerMessageHandler<PlayerDataMessage>(MSG.PLAYER_DATA, handlePlayerData);
