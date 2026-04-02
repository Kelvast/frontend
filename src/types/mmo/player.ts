import type { Direction, Player } from "mmo-shared";
import type { MovementType } from "../../game-client/movement";

export type AnimationState = MovementType | "idle" | "attacking";

/**
 * Full client-side state for the local (authenticated) player.
 * Extends the shared Player type with interpolation and animation fields.
 * All core fields (id, uuid, name, x, y, z, facing, skills, inventory,
 * equipment) are inherited from Player — never redeclared here.
 */
export interface PlayerState extends Player {
  isMoving: boolean;
  pace: MovementType;
  lastUpdated: number;
  animationState: AnimationState;
}

/**
 * Minimal state for other players visible in the scene.
 * We only know what the server broadcasts — position, facing, name.
 * Skills and inventory are not available for other players.
 */
export interface NearbyPlayer {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  facing: Direction;
  isMoving: boolean;
  lastUpdated: number;
  animationState: AnimationState;
}
