import { MSG, type TickMessage } from "kelvast-shared";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handleTick(msg: TickMessage): void {
  useGameStore.getState().onTick(msg);
}

registerMessageHandler<TickMessage>(MSG.TICK, handleTick);
