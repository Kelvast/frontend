import type { Direction, MovementType, Player } from "kelvast-shared";

export type AnimationState = MovementType | "idle" | "attacking";

/**
 * Full client-side state for the local (authenticated) player.
 * Extends the shared Player type with interpolation and animation fields.
 * All core fields (id, uuid, name, x, y, z, facing, skills, inventory,
 * equipment) are inherited from Player - never redeclared here.
 */
export interface PlayerState extends Player {
  isMoving: boolean;
  pace: MovementType;
  lastUpdated: number;
  animationState: AnimationState;
}
