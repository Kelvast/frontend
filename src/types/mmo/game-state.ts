import type {
  SessionOpenedMessage,
  WorldStateMessage,
  PlayerJoinMessage,
  PlayerLeaveMessage,
  TickMessage,
  PlayerStoppedMessage,
  GameSession,
  PlayerIdentity,
} from "mmo-shared";
import type { PlayerState, NearbyPlayer } from "./player";
import type { UserSettings } from "./settings";

export interface GameStoreState {
  // ── Identity & sessions ──────────────────────────────────────────────────
  /** Stable uuid + name from AuthSuccessResponse. Set at login, survives navigation. */
  identity: PlayerIdentity | null;
  /** Short-lived token issued by POST /api/game/session. Zustand only - never persisted. */
  gameSessionToken: string | null;
  /** Unix ms expiry for gameSessionToken. Check against Date.now() before calling connectWS. */
  gameSessionExpiresAt: number | null;

  // ── World ─────────────────────────────────────────────────────────────────
  /** Full local player state. Null until session_opened received over WS. */
  localPlayer: PlayerState | null;
  /** All players currently visible to this client (within chunk radius). */
  nearbyPlayers: NearbyPlayer[];
  worldTime: number;

  // ── Connection ────────────────────────────────────────────────────────────
  isConnected: boolean;

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: UserSettings;

  // ── Auth actions ──────────────────────────────────────────────────────────
  /** Called after successful login or registration. Stores uuid + name only. */
  storeIdentity: (identity: PlayerIdentity) => void;
  /** Called after POST /api/game/session resolves. Stores token in memory only. */
  storeGameSession: (session: GameSession) => void;

  // ── Connection actions ────────────────────────────────────────────────────
  setConnected: (connected: boolean) => void;

  // ── WS message handlers ───────────────────────────────────────────────────
  /**
   * Handles session_opened. Merges the server-authoritative PlayerPresence
   * (id, x, y, z, facing) with the identity already in the store (uuid, name)
   * and default game state (skills, inventory, equipment) to produce a full
   * PlayerState. SessionOpenedMessage only carries PlayerPresence - skills and
   * inventory are not on the WS message.
   */
  onLoginSuccess: (msg: SessionOpenedMessage) => void;
  onLogout: () => Promise<void>;
  /** Handles world_state. Populates nearbyPlayers from the initial snapshot. */
  onWorldState: (msg: WorldStateMessage) => void;
  /** Handles player_join. Adds or updates a single player in nearbyPlayers. */
  onPlayerJoin: (msg: PlayerJoinMessage) => void;
  /** Handles player_leave. Removes a player from nearbyPlayers by session id. */
  onPlayerLeave: (msg: PlayerLeaveMessage) => void;
  /** Handles tick. Applies movement deltas to nearbyPlayers. */
  onTick: (msg: TickMessage) => void;
  /** Handles player_stopped. Snaps a player to their authoritative final position. */
  onPlayerStopped: (msg: PlayerStoppedMessage) => void;

  // ── Settings actions ──────────────────────────────────────────────────────
  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
}
