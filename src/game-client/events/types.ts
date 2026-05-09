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
  PlayerPresence,
  SessionId,
} from 'kelvast-shared';

/*
 * GameEventMap — every in-process event that can flow through the GameEventBus.
 *
 * This file is the contract between all game systems. A type lives here once.
 * Nothing imports from another system directly — everything goes through the bus.
 *
 * ── How systems connect ────────────────────────────────────────────────────
 *
 * The flow for any server-driven event is always the same three steps:
 *
 *   1. WS INBOUND — parses the raw wire message, emits one bus event:
 *
 *        // ws/inbound/movement.ts
 *        case MSG.PLAYER_MOVE_ACK:
 *          gameEventBus.emit('player:move-acked', { path: msg.path, pace: msg.pace });
 *          break;
 *
 *   2. SYSTEM — subscribes during init, reacts to the event, writes to the store:
 *
 *        // systems/movement.ts
 *        export function initMovementSystem(): () => void {
 *          return gameEventBus.on('player:move-acked', ({ path, pace }) => {
 *            PlayerManager.getInstance().startLocalMove(path, pace);
 *            useGameStore.getState().setLocalPlayerMoving(true);
 *          });
 *        }
 *
 *   3. STORE → UI — Zustand notifies React; the HUD re-renders.
 *
 * Input events run the same pattern in reverse — the system emits, a game
 * system subscribes:
 *
 *        // systems/input-keys.ts
 *        gameEventBus.emit('input:intent', { intent: 'orbit-left' });
 *
 *        // systems/camera.ts
 *        gameEventBus.on('input:intent', ({ intent }) => { ... });
 *
 * ── Rules ──────────────────────────────────────────────────────────────────
 *
 *   - Payloads are plain objects — no class instances, no Babylon types.
 *   - Derive payloads from mmo-shared types via Pick<> — never redefine inline.
 *   - One entry per event. Emitter and listener documented on the entry.
 *   - To add an event: add it here, emit in the inbound/system, subscribe in the system.
 */
export interface GameEventMap {

  // ── Session ───────────────────────────────────────────────────────────────
  // Emitter: ws/inbound/session.ts  |  Listener: systems/session.ts

  // Server confirmed the WS handshake. Carries player presence + world name.
  // This is the signal to seed localPlayer state and enable game input.
  'session:opened': SessionOpenedMessage;

  // Server rejected the token (expired, already connected, malformed).
  // Route back to the lobby screen.
  'session:rejected': Pick<SessionRejectedMessage, 'message'>;

  // Session ended — either the player logged out or the server closed it.
  // destroyGame() is called in response; bus.clear() follows.
  'session:closed': Record<string, never>;

  // Private game state (skills, inventory, equipment) arrived.
  // This is the second half of the two-message hydration pair after session:opened.
  'session:player-data': PlayerDataMessage;

  // ── Player ────────────────────────────────────────────────────────────────
  // Emitter: ws/inbound/movement.ts  |  Listener: systems/movement.ts

  // Server ACKed the move. Path and pace are authoritative.
  // systems/movement.ts begins optimistic prediction immediately on receipt.
  'player:move-acked': Pick<PlayerMoveAckMessage, 'path' | 'pace'>;

  // Server tick — position deltas for every player who moved this tick.
  // systems/movement.ts reconciles localPlayer prediction against this.
  // systems/players.ts drives remote player interpolation from this.
  'player:tick': Pick<TickMessage, 'timestamp' | 'players'>;

  // Emitter: PlayerManager (systems/players.ts)  |  Listener: systems/movement.ts
  // Local player mesh physically reached a tile. Clears prediction state.
  'player:arrived': { x: number; z: number; y: number; floor: number };

  // Emitter: ws/inbound/movement.ts  |  Listener: systems/movement.ts, systems/players.ts
  // Authoritative final position for any player who stopped moving.
  // If id matches localPlayer, snap position and clear any active prediction.
  'player:stopped': Pick<PlayerStoppedMessage, 'id' | 'x' | 'y' | 'z' | 'floor' | 'facing'>;

  // ── Area ──────────────────────────────────────────────────────────────────
  // Emitter: ws/inbound/area.ts  |  Listener: systems/players.ts

  // Initial snapshot of all visible players when joining or changing region.
  // systems/players.ts calls PlayerManager.addPlayer() for each entry.
  'area:world-state': { players: PlayerPresence[] };

  // A player entered this client's visible range.
  'area:player-joined': { player: PlayerPresence };

  // A player left this client's visible range or disconnected.
  'area:player-left': { id: SessionId };

  // ── Action ────────────────────────────────────────────────────────────────
  // Emitter: ws/inbound/actions.ts  |  Listener: systems/actions.ts

  // Server confirmed the action started (chop, mine, fish, etc.).
  'action:started': { targetId: number };

  // Gather tick rolled and failed — action is still running, keep animating.
  'action:ongoing': Pick<ActionOngoingMessage, 'targetId'>;

  // Action ended. If reason is 'success', reward carries XP and loot to apply.
  'action:finished': Pick<ActionFinishedMessage, 'reason' | 'reward'>;

  // ── World ─────────────────────────────────────────────────────────────────
  // Emitter: ws/inbound/world.ts  |  Listener: systems/world.ts

  // Resource node was successfully gathered — show depleted visual state.
  'world:resource-depleted': Pick<ResourceDepletedMessage, 'targetId'>;

  // Depleted node has respawned — restore normal visual state.
  'world:resource-available': Pick<ResourceAvailableMessage, 'targetId'>;

  // ── Input ─────────────────────────────────────────────────────────────────

  // Emitter: systems/input-keys.ts  |  Listener: systems/camera.ts
  // Normalised camera intent from keyboard (WASD) or gamepad (future).
  // Input systems never call camera methods directly — they emit here.
  'input:intent': {
    intent:
      | 'orbit-left'
      | 'orbit-right'
      | 'orbit-up'
      | 'orbit-down'
      | 'zoom-in'
      | 'zoom-out';
  };

  // Emitter: systems/input-pointer.ts  |  Listener: systems/movement.ts
  // A left-click resolved to a walkable tile. Movement is the default handler
  // (priority 0). Future systems (combat, actions) register at higher priority
  // and can consume the click before it reaches movement.
  'input:tile-clicked': { tileX: number; tileZ: number };
}

export type GameEventKey = keyof GameEventMap;
export type GameEventPayload<K extends GameEventKey> = GameEventMap[K];
