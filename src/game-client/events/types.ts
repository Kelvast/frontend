import type { Coords, ResolvedPace, SessionOpenedMessage } from 'mmo-shared';

/*
 * GameEventMap — canonical registry of every in-process game event.
 *
 * Naming convention: '<domain>:<verb>' using snake_case strings.
 *
 * Domains:
 *   session   — WS session lifecycle (opened, rejected, closed)
 *   player    — local player state (move, ack, stop)
 *   area      — world/area population (join, leave, world state)
 *   action    — server-driven action lifecycle (start, ongoing, finished)
 *   world     — resource node state
 *   input     — normalised intent from input systems (keys, pointer, gamepad)
 *
 * Rules:
 *   - Payloads are plain objects — no class instances.
 *   - Never import Babylon or React types here.
 *   - Add a comment above each event describing who emits and who listens.
 */
export interface GameEventMap {
  // ── Session ────────────────────────────────────────────────────────────────

  /** Emitted by: ws/inbound/session.ts  |  Listened by: systems/session.ts */
  'session:opened': SessionOpenedMessage;

  /** Emitted by: ws/inbound/session.ts  |  Listened by: systems/session.ts */
  'session:rejected': { reason: string };

  /** Emitted by: ws/inbound/session.ts  |  Listened by: systems/session.ts */
  'session:closed': { reason: string };

  // ── Player ─────────────────────────────────────────────────────────────────

  /** Emitted by: ws/inbound/movement.ts  |  Listened by: systems/movement.ts */
  'player:move-acked': { path: Coords[]; pace: ResolvedPace };

  /** Emitted by: ws/inbound/movement.ts  |  Listened by: systems/movement.ts */
  'player:stopped': { x: number; z: number };

  // ── Area ───────────────────────────────────────────────────────────────────

  /** Emitted by: ws/inbound/area.ts  |  Listened by: systems/players.ts */
  'area:player-joined': { uuid: string; name: string; x: number; z: number };

  /** Emitted by: ws/inbound/area.ts  |  Listened by: systems/players.ts */
  'area:player-left': { uuid: string };

  /** Emitted by: ws/inbound/area.ts  |  Listened by: systems/players.ts */
  'area:world-state': { players: Array<{ uuid: string; name: string; x: number; z: number }> };

  // ── Action ─────────────────────────────────────────────────────────────────

  /** Emitted by: ws/inbound/actions.ts  |  Listened by: systems/actions.ts (future) */
  'action:started': { actionId: string; targetId: string };

  /** Emitted by: ws/inbound/actions.ts  |  Listened by: systems/actions.ts (future) */
  'action:ongoing': { actionId: string; progress: number };

  /** Emitted by: ws/inbound/actions.ts  |  Listened by: systems/actions.ts (future) */
  'action:finished': { actionId: string };

  // ── World ──────────────────────────────────────────────────────────────────

  /** Emitted by: ws/inbound/world.ts  |  Listened by: systems/world.ts (future) */
  'world:resource-available': { nodeId: string };

  /** Emitted by: ws/inbound/world.ts  |  Listened by: systems/world.ts (future) */
  'world:resource-depleted': { nodeId: string };

  // ── Input ──────────────────────────────────────────────────────────────────

  /**
   * Normalised directional intent from any input device.
   * Emitted by: systems/input-keys.ts (WASD), systems/input-gamepad.ts (future)
   * Listened by: systems/camera.ts
   */
  'input:intent': {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  };

  /**
   * A tile in the world was clicked with intent to move there.
   * Emitted by: systems/input-pointer.ts
   * Listened by: systems/movement.ts
   */
  'input:tile-clicked': { tileX: number; tileZ: number };
}

export type GameEventKey = keyof GameEventMap;
export type GameEventPayload<K extends GameEventKey> = GameEventMap[K];
