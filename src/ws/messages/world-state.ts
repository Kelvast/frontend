import { MSG, type WorldStateMessage } from "kelvast-shared";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handleWorldState(msg: WorldStateMessage): void {
  useGameStore.getState().onWorldState(msg);
}

registerMessageHandler<WorldStateMessage>(MSG.WORLD_STATE, handleWorldState);
