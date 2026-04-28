import { create } from "zustand";
import type { GameStoreState } from "../types";
import type { UserSettings } from "../types/mmo/settings";
import { loadSettings, patchSettings } from "./settings";
import { logger } from "./logger";
import { maxHpFromSkills } from "./xp";

export const useGameStore = create<GameStoreState>((set) => ({
  localPlayer: null,
  nearbyPlayers: [],
  worldTime: 0,
  isConnected: false,
  latency: 0,
  gameSessionToken: null,
  gameSessionExpiresAt: null,
  settings: loadSettings(),

  setConnected: (connected) => {
    logger.game("Connection state:", connected ? "connected" : "disconnected");
    set({ isConnected: connected });
  },

  setLatency: (latency) => set({ latency }),

  setSession: ({ gameSessionToken, gameSessionExpiresAt }) => {
    logger.game("Game session stored, expires:", new Date(gameSessionExpiresAt).toISOString());
    set({ gameSessionToken, gameSessionExpiresAt });
  },

  /*
   * Called immediately after a successful HTTP login or register response.
   * AuthSuccessResponse is the only source of truth for skills, inventory,
   * and equipment - these fields are never sent over the WS connection.
   * Must be called before connectWS so hydrateLocalPlayer has a base to
   * spread position onto.
   */
  setLocalPlayer: ({ id, uuid, name, x, y, z, facing, skills, inventory, equipment }) => {
    const localPlayer = {
      id,
      uuid,
      name,
      x,
      y,
      z,
      facing,
      skills,
      inventory,
      equipment,
      isMoving: false,
      pace: "walk" as const,
      lastUpdated: Date.now(),
      animationState: "idle" as const,
    };
    logger.game("Local player set from HTTP - id:", id, "uuid:", uuid);
    logger.game("HP:", maxHpFromSkills(skills));
    set({ localPlayer });
  },

  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = patchSettings(key, value);
    logger.game(`Settings updated - ${key}:`, value);
    set({ settings: updated });
  },

  /*
   * Called on login_success. LoginSuccessMessage only carries PlayerPresence
   * (id, uuid, name, x, y, z, facing) plus worldName. Skills, inventory, and
   * equipment survive from setLocalPlayer - only position and id are
   * overridden here since the WS server is authoritative for spawn position.
   */
  hydrateLocalPlayer: (msg) => {
    set((state) => {
      if (!state.localPlayer) {
        logger.warn("hydrateLocalPlayer called before setLocalPlayer - no base state to hydrate onto");
        return {};
      }
      const localPlayer = {
        ...state.localPlayer,
        id: msg.id,
        x: msg.x,
        y: msg.y,
        z: msg.z,
        facing: msg.facing,
        isMoving: false,
        pace: "walk" as const,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      };
      logger.game("Local player hydrated from login_success - id:", msg.id, "uuid:", msg.uuid);
      logger.game("HP:", maxHpFromSkills(localPlayer.skills));
      return { localPlayer };
    });
  },

  registerPlayer: (msg) =>
    set((state) => {
      const player = {
        id: msg.player.id,
        name: msg.player.name,
        x: msg.player.x,
        y: msg.player.y,
        z: msg.player.z,
        facing: msg.player.facing,
        isMoving: false,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      };
      logger.game("Player registered - id:", msg.player.id, "name:", msg.player.name);
      const exists = state.nearbyPlayers.some((p) => p.id === msg.player.id);
      return {
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === msg.player.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  unregisterPlayer: (id) =>
    set((state) => {
      logger.game("Player unregistered - id:", id);
      return { nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id) };
    }),

  applyTick: ({ deltas }) =>
    set((state) => {
      const updates = new Map(
        deltas.map(({ id, x, y, z, facing, pace }) => [id, { x, y, z, facing, pace, isMoving: true }]),
      );
      return {
        nearbyPlayers: state.nearbyPlayers.map((player) => {
          const delta = updates.get(player.id);
          if (!delta) return player;
          return { ...player, ...delta, lastUpdated: Date.now() };
        }),
      };
    }),
}));
