import { logger } from '../../utils/logger';
import type { GameEventKey, GameEventMap, GameEventPayload } from './types';

type Listener<K extends GameEventKey> = (payload: GameEventPayload<K>) => void;
type AnyListener = (payload: unknown) => void;

/*
 * GameEventBus — typed in-process pub/sub for all game system communication.
 *
 * WHY THIS EXISTS:
 *   Systems must not call each other directly. Input must not know about camera.
 *   WS handlers must not know about the store. This bus is the contract between them.
 *
 * HOW TO SUBSCRIBE (in a system's init function):
 *
 *   export function initMySystem(): () => void {
 *     const off = gameEventBus.on('some:event', ({ field }) => {
 *       // react to the event
 *     });
 *     return off; // teardown: called by bootstrapGameClient cleanup
 *   }
 *
 * HOW TO EMIT (in a ws/inbound handler or a system):
 *
 *   gameEventBus.emit('some:event', { field: value });
 *
 * LIFECYCLE:
 *   - bus.on()    — subscribe. Returns an unsubscribe fn. Store it and call it on dispose.
 *   - bus.off()   — explicit unsubscribe (alternative to the returned fn).
 *   - bus.emit()  — synchronous fan-out. All listeners run before emit() returns.
 *   - bus.clear() — removes ALL listeners. Called only by destroyGame() to hard-reset
 *                   state between sessions. Never call from a system.
 *
 * ERROR ISOLATION:
 *   Each listener is wrapped in try/catch. One broken handler never silences others.
 *   Errors are logged via logger.error with the event name for easy tracing.
 *
 * THREADING:
 *   Synchronous. No queuing. No async. The emit caller blocks until all listeners return.
 *   This is intentional — game loop consistency depends on deterministic ordering.
 */
class GameEventBus {
  private listeners = new Map<GameEventKey, Set<AnyListener>>();

  /*
   * Subscribe to an event. Returns an unsubscribe function.
   *
   * Always store the return value and call it in your system's dispose/teardown:
   *
   *   const off = gameEventBus.on('player:tick', handler);
   *   // later:
   *   off();
   */
  on<K extends GameEventKey>(event: K, listener: Listener<K>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as AnyListener);
    return () => this.off(event, listener);
  }

  /*
   * Unsubscribe a specific listener from an event.
   * Prefer using the fn returned by on() over calling this directly.
   */
  off<K extends GameEventKey>(event: K, listener: Listener<K>): void {
    this.listeners.get(event)?.delete(listener as AnyListener);
  }

  /*
   * Emit an event. Runs all subscribed listeners synchronously in insertion order.
   *
   * Listeners that throw are caught, logged, and skipped — execution continues
   * for the remaining listeners on that event.
   */
  emit<K extends GameEventKey>(event: K, payload: GameEventPayload<K>): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) {
      logger.debug(`[bus] no listeners for: ${event}`);
      return;
    }
    for (const listener of set) {
      try {
        listener(payload);
      } catch (err) {
        logger.error(`[bus] listener threw on event "${event}":`, err);
      }
    }
  }

  /*
   * Remove all listeners from all events.
   *
   * Called exclusively by destroyGame() to fully reset the bus between game
   * sessions (e.g. disconnect → reconnect in the same browser tab).
   * Never call this from a system — systems use their unsubscribe fns.
   */
  clear(): void {
    this.listeners.clear();
  }

  /*
   * Returns the number of active listeners for a given event.
   * Useful for assertions in tests and dev tooling — not for runtime branching.
   */
  listenerCount(event: GameEventKey): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const gameEventBus = new GameEventBus();
