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
  sessionToken: null,
  sessionExpiresAt: null,
  settings: loadSettings(),

  setConnected: (connected) => {
    logger.game("Connection state:", connected ? "connected" : "disconnected");
    set({ isConnected: connected });
  },

  setLatency: (latency) => set({ latency }),

  setSession: ({ sessionToken, sessionExpiresAt }) => {
    logger.game("Session stored, expires:", new Date(sessionExpiresAt).toISOString());
    set({ sessionToken, sessionExpiresAt });
  },

  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = patchSettings(key, value);
    logger.game(`Settings updated — ${key}:`, value);
    set({ settings: updated });
  },

  hydrateLocalPlayer: (msg) => {
    const localPlayer = {
      id: msg.id,
      uuid: msg.uuid,
      name: msg.name,
      x: msg.x,
      y: msg.y,
      z: msg.z,
      facing: msg.facing,
      skills: msg.skills,
      inventory: msg.inventory,
      equipment: msg.equipment,
      isMoving: false,
      pace: "walk" as const,
      lastUpdated: Date.now(),
      animationState: "idle" as const,
    };
    logger.game("Local player hydrated — id:", msg.id, "uuid:", msg.uuid);
    logger.game("HP:", maxHpFromSkills(msg.skills));
    set({ localPlayer });
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
      logger.game("Player registered — id:", msg.player.id, "name:", msg.player.name);
      const exists = state.nearbyPlayers.some((p) => p.id === msg.player.id);
      return {
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === msg.player.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  unregisterPlayer: (id) =>
    set((state) => {
      logger.game("Player unregistered — id:", id);
      return { nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id) };
    }),

  applyTick: ({ p }) =>
    set((state) => {
      const updates = new Map(
        p.map(([id, x, y, z, facing]) => [id, { x, y, z, facing, isMoving: true }]),
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
