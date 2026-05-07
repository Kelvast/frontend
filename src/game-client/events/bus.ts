import { logger } from '../../utils/logger';
import type { GameEventKey, GameEventMap, GameEventPayload } from './types';

type Listener<K extends GameEventKey> = (payload: GameEventPayload<K>) => void;
type AnyListener = (payload: unknown) => void;

/*
 * GameEventBus — typed in-process pub/sub.
 *
 * All game systems communicate through this bus instead of calling each
 * other directly. WS inbound handlers parse + emit. Systems subscribe.
 *
 * Lifecycle:
 *   - Systems call bus.on() during init and store the returned unsubscribe fn.
 *   - Systems call their unsubscribe fn during dispose().
 *   - bus.clear() is called by destroyGame() to hard-reset all listeners.
 *
 * No async. No queueing. Synchronous fan-out to all listeners on emit.
 */
class GameEventBus {
  private listeners = new Map<GameEventKey, Set<AnyListener>>();

  on<K extends GameEventKey>(event: K, listener: Listener<K>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as AnyListener);
    return () => this.off(event, listener);
  }

  off<K extends GameEventKey>(event: K, listener: Listener<K>): void {
    this.listeners.get(event)?.delete(listener as AnyListener);
  }

  emit<K extends GameEventKey>(event: K, payload: GameEventPayload<K>): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) {
      logger.game(`[bus] no listeners for: ${event}`);
      return;
    }
    for (const listener of set) {
      try {
        listener(payload);
      } catch (err) {
        logger.error(`[bus] listener error on ${event}:`, err);
      }
    }
  }

  /*
   * Removes all listeners. Called by destroyGame() so a fresh startGame()
   * call begins with a clean bus.
   */
  clear(): void {
    this.listeners.clear();
  }

  listenerCount(event: GameEventKey): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

export const gameEventBus = new GameEventBus();
