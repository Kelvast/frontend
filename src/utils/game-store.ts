import { create } from "zustand";
import type { GameStoreState } from "../types";
import type { UserSettings } from "../types/mmo/settings";
import { loadSettings, patchSettings } from "./settings";
import { logger } from "./logger";
import { defaultSkills, defaultInventory, defaultEquipment } from "mmo-shared";

export const useGameStore = create<GameStoreState>((set) => ({
  identity: null,
  gameSessionToken: null,
  gameSessionExpiresAt: null,
  localPlayer: null,
  nearbyPlayers: [],
  worldTime: 0,
  isConnected: false,
  settings: loadSettings(),

  setConnected: (connected) => {
    logger.game("Connection state:", connected ? "connected" : "disconnected");
    set({ isConnected: connected });
  },

  /*
   * Stores uuid + name from the auth response. Called at login and register.
   * This is the only thing the HTTP auth layer gives us - no game state.
   */
  storeIdentity: ({ uuid, playerName }) => {
    logger.auth("Identity stored - uuid:", uuid, "playerName:", playerName);
    set({ identity: { uuid, playerName } });
  },

  /*
   * Stores the game session token issued by POST /api/game/session.
   * Held in Zustand only - never written to localStorage or a cookie.
   * Passed to connectWS() when the player clicks Play.
   */
  storeGameSession: ({ gameSessionToken, gameSessionExpiresAt }) => {
    logger.game("Game session stored, expires:", new Date(gameSessionExpiresAt).toISOString());
    set({ gameSessionToken, gameSessionExpiresAt });
  },

  /*
   * Handles session_opened. SessionOpenedMessage carries PlayerPresence only
   * (id, uuid, name, x, y, z, facing) - skills, inventory, and equipment are
   * not on the WS message. We build a full PlayerState by merging the
   * authoritative position from the message with identity from the store.
   * Default skills/inventory/equipment are used until a future player_data
   * message brings the real values.
   */
  onLoginSuccess: (msg) => {
    set((state) => {
      if (!state.identity) {
        logger.warn("onLoginSuccess called before storeIdentity - identity missing");
      }
      const localPlayer = {
        id: msg.id,
        uuid: state.identity?.uuid ?? msg.uuid,
        playerName: state.identity?.playerName ?? msg.playerName,
        x: msg.x,
        y: msg.y,
        z: msg.z,
        facing: msg.facing,
        skills: defaultSkills(),
        inventory: defaultInventory(),
        equipment: defaultEquipment(),
        isMoving: false,
        pace: "walk" as const,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      };
      logger.game("Local player ready - id:", msg.id, "uuid:", localPlayer.uuid);
      return { localPlayer };
    });
  },

  onLogout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({
      identity: null,
      gameSessionToken: null,
      gameSessionExpiresAt: null,
      localPlayer: null,
      nearbyPlayers: [],
      isConnected: false,
    });
    logger.auth("Logged out - identity and session cleared");
  },

  /*
   * Handles world_state. Replaces nearbyPlayers with the initial snapshot
   * of all players visible to this client on entry.
   */
  onWorldState: ({ players }) => {
    set({
      nearbyPlayers: players.map((p) => ({
        id: p.id,
        playerName: p.playerName,
        x: p.x,
        y: p.y,
        z: p.z,
        facing: p.facing,
        isMoving: false,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      })),
    });
    logger.game("World state received - players in range:", players.length);
  },

  /*
   * Handles player_join. Upserts the player into nearbyPlayers - if the id
   * already exists (e.g. stale entry) it is replaced, otherwise appended.
   */
  onPlayerJoin: (msg) =>
    set((state) => {
      const player = {
        id: msg.player.id,
        playerName: msg.player.playerName,
        x: msg.player.x,
        y: msg.player.y,
        z: msg.player.z,
        facing: msg.player.facing,
        isMoving: false,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      };
      logger.game("Player joined - id:", msg.player.id, "playerName:", msg.player.playerName);
      const exists = state.nearbyPlayers.some((p) => p.id === msg.player.id);
      return {
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === msg.player.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  /*
   * Handles player_leave. Removes the player from nearbyPlayers by session id.
   */
  onPlayerLeave: ({ id }) =>
    set((state) => {
      logger.game("Player left - id:", id);
      return { nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id) };
    }),

  /*
   * Handles tick. Applies movement deltas to nearbyPlayers using a Map for
   * O(1) lookup per player. Players absent from deltas are unchanged.
   */
  onTick: ({ players }) =>
    set((state) => {
      const updates = new Map(
        players.map(({ id, x, y, z, facing, pace }) => [
          id,
          { x, y, z, facing, pace, isMoving: true },
        ]),
      );
      return {
        nearbyPlayers: state.nearbyPlayers.map((player) => {
          const delta = updates.get(player.id);
          if (!delta) return player;
          return { ...player, ...delta, lastUpdated: Date.now() };
        }),
      };
    }),

  /*
   * Handles player_stopped. Snaps the player to the server-authoritative
   * final position to correct any interpolation drift from the tick stream.
   */
  onPlayerStopped: ({ id, x, y, z, facing }) =>
    set((state) => ({
      nearbyPlayers: state.nearbyPlayers.map((p) =>
        p.id === id ? { ...p, x, y, z, facing, isMoving: false, lastUpdated: Date.now() } : p,
      ),
    })),

  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = patchSettings(key, value);
    logger.game(`Settings updated - ${key}:`, value);
    set({ settings: updated });
  },
}));
