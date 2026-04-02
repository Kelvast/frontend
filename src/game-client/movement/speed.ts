import { PLAYER } from "mmo-shared";

export type MovementType = "sneak" | "walk" | "run" | "mounted";

export const PACE_MULTIPLIER: Record<MovementType, number> = {
  sneak: 0.4,
  walk: 1.0,
  run: 1.6,
  mounted: 2.4,
};

export function calcMoveSpeed(pace: MovementType): number {
  return PLAYER.BASE_SPEED * PACE_MULTIPLIER[pace];
}
