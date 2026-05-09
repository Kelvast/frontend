import type { Coords, ResolvedPace } from "kelvast-shared";
import { calcMoveSpeed, DEFAULT_SPEED_MODIFIERS } from "kelvast-shared";
import { getContext } from "../context";
import { useGameStore } from "../../utils/game-store";
import { sendPlayerMove } from "../../ws/messages/move";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { buildClientPath } from "./pathfinding";

export function requestMove(toX: number, toZ: number): void {
  const { world } = getContext();
  const localPlayer = useGameStore.getState().localPlayer;
  if (!localPlayer) return;

  const path = buildClientPath(localPlayer.x, localPlayer.z, toX, toZ, world);
  if (!path.length) return;

  const pace = calcMoveSpeed("walk", DEFAULT_SPEED_MODIFIERS);

  if (DEV_MODE) logger.game("requestMove", { toX, toZ, pathLength: path.length });

  sendPlayerMove(toX, toZ, path, pace);
}
