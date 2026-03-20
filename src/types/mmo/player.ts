import { Position } from "./position";

export interface PlayerStats {
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
}

export interface PlayerState {
  id: string;
  name: string;
  position: Position;
  facing: number;
  stats: PlayerStats;
  isMoving: boolean;
  lastUpdated: number;
  animationState?: "idle" | "walking" | "running" | "attacking";
}
