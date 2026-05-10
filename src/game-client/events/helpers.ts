import { gameEventBus } from "./bus";
import type { GameEventKey, GameEventPayload } from "./types";

/**
 * Creates a named, typed emit function for a single event key.
 *
 * Used by emitters.ts to generate all emitX helpers. Centralising
 * construction here means emit logic (bus call, future middleware) lives
 * in one place and never leaks into individual system files.
 *
 * Usage (in emitters.ts only):
 *   export const emitPlayerTick = createEmitter(GAME_EVENT.PLAYER_TICK);
 *
 * Callers should never import createEmitter directly — use the named emitX
 * functions from emitters.ts instead.
 */
export const createEmitter =
  <K extends GameEventKey>(event: K) =>
  (payload: GameEventPayload<K>): void =>
    gameEventBus.emit(event, payload);

/**
 * Creates a named, typed listener registration function for a single event key.
 *
 * Used by listeners.ts to generate all onX helpers. Returns an unsubscribe
 * function — always store it and call it in the system's dispose/cleanup.
 *
 * Usage (in listeners.ts only):
 *   export const onPlayerTick = createListener(GAME_EVENT.PLAYER_TICK);
 *
 * Callers should never import createListener directly — use the named onX
 * functions from listeners.ts instead.
 */
export const createListener =
  <K extends GameEventKey>(event: K) =>
  (fn: (payload: GameEventPayload<K>) => void): (() => void) =>
    gameEventBus.on(event, fn);
