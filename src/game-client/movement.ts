import { Skills } from "../types/mmo/skills";
import { MOVEMENT } from "./constants";

export type MovementType = "sneak" | "walk" | "run" | "mounted";

export const PACE_MULTIPLIER: Record<MovementType, number> = {
  sneak:   0.4,
  walk:    1.0,
  run:     1.8,
  mounted: 3.5,
};

export function calcMoveSpeed(skills: Skills, pace: MovementType): number {
  return (MOVEMENT.BASE_SPEED + skills.agility * MOVEMENT.AGILITY_FACTOR) * PACE_MULTIPLIER[pace];
}
