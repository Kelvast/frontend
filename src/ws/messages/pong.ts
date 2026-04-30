import type { PongMessage } from "../types";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handlePong(msg: PongMessage): void {
  useGameStore.getState().setLatency(Date.now() - msg.t);
}

registerMessageHandler<PongMessage>("pong", handlePong);
