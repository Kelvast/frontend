import { Vector3 } from "@babylonjs/core";
import { MOVEMENT } from "../constants";

const ANIM_FPS = 60;
const FRAMES_PER_TILE = Math.round((MOVEMENT.TILE_DURATION_MS / 1000) * ANIM_FPS);

export interface MoveAnimationData {
  keys: { frame: number; value: Vector3 }[];
  totalFrames: number;
  fps: number;
}

export function buildMoveAnimation(
  from: Vector3,
  waypoints: Vector3[],
  framesPerTile: number,
): MoveAnimationData {
  const totalFrames = waypoints.length * framesPerTile;
  const keys = [{ frame: 0, value: from }];
  waypoints.forEach((wp, i) => {
    keys.push({ frame: (i + 1) * framesPerTile, value: wp });
  });
  return { keys, totalFrames, fps: ANIM_FPS };
}
