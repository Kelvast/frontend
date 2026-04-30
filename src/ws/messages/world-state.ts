import type { WorldStateMessage } from "mmo-shared";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handleWorldState(msg: WorldStateMessage): void {
  useGameStore.getState().onWorldState(msg);
}

registerMessageHandler<WorldStateMessage>("world_state", handleWorldState);
