import { logger } from "../../utils/logger";
import type { GameEventKey, GameEventMap, GameEventPayload } from "./types";

type Listener<K extends GameEventKey> = (payload: GameEventPayload<K>) => void;
type AnyListener = (payload: unknown) => void;

/*
 * GameEventBus — typed in-process pub/sub.
 *
 * Systems communicate through this bus rather than calling each other directly.
 * See types.ts for the full event registry and the end-to-end flow example.
 *
 * Usage:
 *
 *   // Subscribe (always store the returned teardown fn):
 *   const off = onPlayerTick(({ players }) => { ... });
 *
 *   // Emit:
 *   emitPlayerMoveAcked({ path, pace });
 *
 *   // Teardown (call in your system's dispose/cleanup):
 *   off();
 *
 *   // Full reset between sessions (destroyGame() only):
 *   gameEventBus.clear();
 *
 * Direct calls to gameEventBus.emit() and gameEventBus.on() are banned outside
 * of emitters.ts and listeners.ts respectively. Use the named emitX / onX helpers.
 */
class GameEventBus {
  private listeners = new Map<GameEventKey, Set<AnyListener>>();

  // Subscribe to an event. Returns an unsubscribe function — always call it on teardown.
  on<K extends GameEventKey>(event: K, listener: Listener<K>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as AnyListener);
    return () => this.off(event, listener);
  }

  // Unsubscribe a specific listener. Prefer the fn returned by on() over calling this directly.
  off<K extends GameEventKey>(event: K, listener: Listener<K>): void {
    this.listeners.get(event)?.delete(listener as AnyListener);
  }

  // Synchronous fan-out to all listeners. One listener throwing never silences the rest.
  // On throw: logs the error and emits bus:error so systems can react to failures.
  // bus:error itself never re-emits to prevent infinite recursion.
  emit<K extends GameEventKey>(event: K, payload: GameEventPayload<K>): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) {
      logger.event(`[bus] no listeners for: ${event}`);
      return;
    }
    for (const listener of set) {
      try {
        listener(payload);
      } catch (err) {
        logger.error(`[bus] listener threw on "${event}":`, err);
        if (event !== "bus:error") {
          this.emit("bus:error", { event, err });
        }
      }
    }
  }

  // Remove all listeners. Called only by destroyGame() — never from a system.
  clear(): void {
    this.listeners.clear();
  }

  // Number of active listeners for an event. For tests and dev tooling only.
  listenerCount(event: GameEventKey): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const gameEventBus = new GameEventBus();
