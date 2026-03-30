import { Vector3 } from "@babylonjs/core";
import { Skills } from "../types/mmo/skills";
import { MOVEMENT, PLAYER } from "./constants";

export type MovementType = "sneak" | "walk" | "run" | "mounted";

export const PACE_MULTIPLIER: Record<MovementType, number> = {
  sneak: 0.4,
  walk: 1.0,
  run: 1.8,
  mounted: 3.5,
};

const ANIM_FPS = 60;
const FRAMES_PER_TILE = Math.round((MOVEMENT.TILE_DURATION_MS / 1000) * ANIM_FPS);

export function calcMoveSpeed(skills: Skills, pace: MovementType): number {
  return (MOVEMENT.BASE_SPEED + skills.agility.level * 0.05) * PACE_MULTIPLIER[pace];
}

export function buildWaypoints(from: Vector3, toX: number, toZ: number): Vector3[] {
  let cx = Math.round(from.x);
  let cz = Math.round(from.z);
  const endX = Math.round(toX);
  const endZ = Math.round(toZ);
  const waypoints: Vector3[] = [];

  while (cx !== endX || cz !== endZ) {
    const dx = endX - cx;
    const dz = endZ - cz;
    if (Math.abs(dx) >= Math.abs(dz)) {
      cx += Math.sign(dx);
    } else {
      cz += Math.sign(dz);
    }
    waypoints.push(new Vector3(cx, PLAYER.Y_OFFSET, cz));
  }

  return waypoints;
}

export function buildMoveAnimation(from: Vector3, waypoints: Vector3[]) {
  const totalFrames = waypoints.length * FRAMES_PER_TILE;

  const keys = [{ frame: 0, value: from }];
  waypoints.forEach((wp, i) => {
    keys.push({ frame: (i + 1) * FRAMES_PER_TILE, value: wp });
  });

  return { keys, totalFrames, fps: ANIM_FPS };
}
