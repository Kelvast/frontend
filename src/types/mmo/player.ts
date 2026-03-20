import { Position } from "./position";
import { MovementType } from "../../game-client/movement";
import { Skills } from "./skills";

export type AnimationState = MovementType | "idle" | "attacking";

export interface PlayerStats {
  level: number;
  experience: number;
  currentHp: number;
  mana: number;
  maxMana: number;
  skills: Skills;
}

export interface PlayerState {
  id: string;
  name: string;
  position: Position;
  facing: number;
  stats: PlayerStats;
  isMoving: boolean;
  pace: MovementType;
  lastUpdated: number;
  animationState: AnimationState;
}
