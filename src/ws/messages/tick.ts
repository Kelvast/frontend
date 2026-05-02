import type { TickMessage } from "mmo-shared";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handleTick(msg: TickMessage): void {
  useGameStore.getState().onTick(msg);
}

registerMessageHandler<TickMessage>("tick", handleTick);
