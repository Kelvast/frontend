import { MSG, type PlayerJoinMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handlePlayerJoin(msg: PlayerJoinMessage): void {
  logger.ws("Player joined - id:", msg.player.id, "name:", msg.player.playerName);
  useGameStore.getState().onPlayerJoin(msg);
}

registerMessageHandler<PlayerJoinMessage>(MSG.PLAYER_JOIN, handlePlayerJoin);
