import { Vector3 } from "@babylonjs/core";

export const ANIM_FPS = 60;

/*
 * framesPerTile is derived at call time from pace (tiles/s):
 *   fpt = ANIM_FPS / pace
 * e.g. walk pace 4 tiles/s → 60/4 = 15 frames per tile → 250ms per tile at 60fps
 * TILE_DURATION_MS is no longer needed — pace is authoritative.
 */

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
