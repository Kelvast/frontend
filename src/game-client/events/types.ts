import type {
  SessionOpenedMessage,
  SessionRejectedMessage,
  PlayerDataMessage,
  PlayerMoveAckMessage,
  PlayerStoppedMessage,
  TickMessage,
  ActionOngoingMessage,
  ActionFinishedMessage,
  ResourceDepletedMessage,
  ResourceAvailableMessage,
} from 'mmo-shared';
import type { PlayerPresence, SessionId } from 'mmo-shared';

/*
 * GameEventMap — the canonical registry of every in-process event that can
 * flow through the GameEventBus.
 *
 * ARCHITECTURE RULES (read before adding an event):
 *
 *   Store  = what the UI needs to render. React re-renders are acceptable here.
 *   Bus    = what game systems need to tell each other. No React, no Zustand writes.
 *   WS in  = parse a raw wire message, emit one bus event. Nothing else.
 *   WS out = format and send a wire message. Nothing else.
 *
 * NAMING CONVENTION:  '<domain>:<verb>'  (kebab-case, colon separator)
 *
 * DOMAINS:
 *   session  — WS session lifecycle: opened, rejected, closed, player-data
 *   player   — local player state: movement ack, tick, arrived, stopped
 *   area     — world population: player join/leave, world state snapshot
 *   action   — server-driven action lifecycle: started, ongoing, finished
 *   world    — resource node availability
 *   input    — normalised intent from any input device
 *
 * PAYLOAD RULES:
 *   - Always plain objects — never class instances.
 *   - Payloads must derive from mmo-shared types, not duplicate inline shapes.
 *   - Never import Babylon or React types here.
 *   - Use Pick<T, ...> rather than redefining subsets inline.
 *
 * HOW TO ADD AN EVENT:
 *   1. Add one entry to GameEventMap below with a comment (emitter | listeners).
 *   2. Add the new event to ws/inbound/ (if WS-triggered) or the emitting system.
 *   3. Subscribe in the relevant system using bus.on().
 *   4. Return the unsubscribe fn from bus.on() and call it in dispose().
 */
export interface GameEventMap {

  // ── Session ──────────────────────────────────────────────────────────────
  //
  // Emitter:  ws/inbound/session.ts
  // Listener: systems/session.ts
  //
  // session:opened      — server confirmed handshake; carries presence + worldName.
  // session:rejected    — server rejected the token; client must return to login.
  // session:closed      — session ended (client or server initiated).
  // session:player-data — private game state (skills/inventory/equipment) has
  //                       arrived; completes the two-message hydration pair.

  'session:opened': SessionOpenedMessage;
  'session:rejected': Pick<SessionRejectedMessage, 'message'>;
  'session:closed': Record<string, never>;
  'session:player-data': PlayerDataMessage;

  // ── Player ────────────────────────────────────────────────────────────────
  //
  // Emitter:  ws/inbound/movement.ts
  // Listener: systems/movement.ts
  //
  // player:move-acked — server confirmed the move request; path and pace are
  //                     authoritative. Begin optimistic prediction immediately.
  // player:tick       — server position deltas for all moving players this tick.
  //                     systems/movement.ts reconciles localPlayer prediction;
  //                     systems/players.ts interpolates remote players.
  //
  // Emitter:  systems/players.ts (via PlayerManager)
  // Listener: systems/movement.ts, systems/session.ts
  //
  // player:arrived    — local player mesh has physically reached the destination
  //                     tile. systems/movement.ts uses this to clear prediction
  //                     state; systems/session.ts updates store position.
  //
  // Emitter:  ws/inbound/movement.ts
  // Listener: systems/movement.ts, systems/players.ts
  //
  // player:stopped    — server's authoritative stop position for any player.
  //                     If id matches localPlayer, snap and clear prediction.

  'player:move-acked': Pick<PlayerMoveAckMessage, 'path' | 'pace'>;
  'player:tick': Pick<TickMessage, 'timestamp' | 'players'>;
  'player:arrived': { x: number; z: number; y: number; floor: number };
  'player:stopped': Pick<PlayerStoppedMessage, 'id' | 'x' | 'y' | 'z' | 'floor' | 'facing'>;

  // ── Area ──────────────────────────────────────────────────────────────────
  //
  // Emitter:  ws/inbound/area.ts
  // Listener: systems/players.ts
  //
  // area:world-state   — initial snapshot of all visible players on region join.
  //                      systems/players.ts seeds PlayerManager from this.
  // area:player-joined — a player entered this client's visible range.
  //                      systems/players.ts calls PlayerManager.addPlayer().
  // area:player-left   — a player left this client's visible range or disconnected.
  //                      systems/players.ts calls PlayerManager.removePlayer().

  'area:world-state': { players: PlayerPresence[] };
  'area:player-joined': { player: PlayerPresence };
  'area:player-left': { id: SessionId };

  // ── Action ────────────────────────────────────────────────────────────────
  //
  // Emitter:  ws/inbound/actions.ts
  // Listener: systems/actions.ts  (stubbed until actions system is built)
  //
  // action:started  — server confirmed the action has begun.
  // action:ongoing  — a gather tick rolled and failed; keep the animation running.
  // action:finished — action ended for any reason (success, interrupted, etc.).
  //                   If reward is present the client should apply XP + loot.

  'action:started': { targetId: number };
  'action:ongoing': Pick<ActionOngoingMessage, 'targetId'>;
  'action:finished': Pick<ActionFinishedMessage, 'reason' | 'reward'>;

  // ── World ─────────────────────────────────────────────────────────────────
  //
  // Emitter:  ws/inbound/world.ts
  // Listener: systems/world.ts  (stubbed until world system is built)
  //
  // world:resource-depleted   — node was gathered; render depleted visual.
  // world:resource-available  — node has respawned; restore normal visual.

  'world:resource-depleted': Pick<ResourceDepletedMessage, 'targetId'>;
  'world:resource-available': Pick<ResourceAvailableMessage, 'targetId'>;

  // ── Input ─────────────────────────────────────────────────────────────────
  //
  // Emitter:  systems/input-keys.ts (WASD), systems/input-gamepad.ts (future)
  // Listener: systems/camera.ts
  //
  // input:intent — normalised directional intent from any input device.
  //               camera.ts subscribes and calls orbit/zoom accordingly.
  //               Input systems never call camera methods directly.
  //
  // Emitter:  systems/input-pointer.ts
  // Listener: systems/movement.ts (registered at priority 0 as the default fallback)
  //
  // input:tile-clicked — a tile in the world was clicked with move intent.
  //                      Higher-priority systems (combat, actions) may consume
  //                      the click first via the PointerInput registry; only
  //                      unhandled clicks reach the movement handler.

  'input:intent': {
    intent:
      | 'orbit-left'
      | 'orbit-right'
      | 'orbit-up'
      | 'orbit-down'
      | 'zoom-in'
      | 'zoom-out';
  };

  'input:tile-clicked': { tileX: number; tileZ: number };
}

// Utility types — derived from the map, used by bus.ts and all emitters/subscribers.
export type GameEventKey = keyof GameEventMap;
export type GameEventPayload<K extends GameEventKey> = GameEventMap[K];
