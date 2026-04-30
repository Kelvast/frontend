import type { PlayerStoppedMessage } from "mmo-shared";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handlePlayerStopped(msg: PlayerStoppedMessage): void {
  useGameStore.getState().onPlayerStopped(msg);
}

registerMessageHandler<PlayerStoppedMessage>("player_stopped", handlePlayerStopped);
