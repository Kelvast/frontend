import type { Position } from "./position";
import type { MovementType } from "../../game-client/movement";
import type { Skills, Inventory, Equipment, Facing } from "mmo-shared";

export type AnimationState = MovementType | "idle" | "attacking";

/**
 * Live client-side state for a single player in the scene.
 *
 * id       — numeric session ID from the server (changes each login).
 * uuid     — persistent identifier, stable across sessions.
 * skills   — raw XP record; derive levels via getSkillLevel() / xpToLevel().
 * hp is intentionally not stored here — derive it from skills[0] via
 * maxHpFromSkills() whenever needed so there is one source of truth.
 */
export interface PlayerState {
  id: number;
  uuid: string;
  name: string;
  position: Position;
  facing: Facing;
  skills: Skills;
  inventory: Inventory;
  equipment: Equipment;
  isMoving: boolean;
  pace: MovementType;
  lastUpdated: number;
  animationState: AnimationState;
}
