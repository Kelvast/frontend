import type { GameEngine } from "./engine/engine";
import type { GameWorld } from "./world";
import type { PlayerManager } from "./entities/players";
import type { GameCamera } from "./systems/camera";
import type { KeysInput } from "./systems/input-keys";
import type { PointerInput } from "./systems/input-pointer";

/*
 * GameContext is the single live object that holds every runtime system.
 * Created once in startup/init.ts after engine + world are ready.
 * Replaces the old nullable module-level singletons in index.ts.
 *
 * Access via getContext() anywhere inside game-client.
 * Outside game-client, nothing should need it directly.
 */
export interface GameContext {
  engine: GameEngine;
  world: GameWorld;
  players: PlayerManager;
  camera: GameCamera;
  keys: KeysInput;
  pointer: PointerInput;
  stopDevWatcher: (() => void) | null;
}

let context: GameContext | null = null;

export function setContext(ctx: GameContext): void {
  context = ctx;
}

export function getContext(): GameContext {
  if (!context) throw new Error("GameContext accessed before init");
  return context;
}

export function hasContext(): boolean {
  return context !== null;
}

export function clearContext(): void {
  context = null;
}
