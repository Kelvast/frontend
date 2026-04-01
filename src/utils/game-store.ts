import { create } from "zustand";
import type { GameStoreState } from "../types";
import type { UserSettings } from "../types/mmo/settings";
import { loadSettings, patchSettings } from "./settings";
import { logger } from "./logger";
import { defaultSkills, defaultInventory, defaultEquipment } from "mmo-shared";
import { maxHpFromSkills } from "./xp";

export const useGameStore = create<GameStoreState>((set) => ({
  myId: null,
  nearbyPlayers: [],
  worldTime: 0,
  isConnected: false,
  latency: 0,
  sessionToken: null,
  sessionExpiresAt: null,
  settings: loadSettings(),

  setMyId: (id: number) => {
    logger.game("My ID set:", id);
    set({ myId: id });
  },

  setConnected: (connected: boolean) => {
    logger.game("Connection state:", connected ? "connected" : "disconnected");
    set({ isConnected: connected });
  },

  setLatency: (latency: number) => set({ latency }),

  setSession: ({ sessionToken, sessionExpiresAt }) => {
    logger.game("Session stored, expires:", new Date(sessionExpiresAt).toISOString());
    set({ sessionToken, sessionExpiresAt });
  },

  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = patchSettings(key, value);
    logger.game(`Settings updated — ${key}:`, value);
    set({ settings: updated });
  },

  // Called on login_success. The server sends the full skill XP record and
  // inventory so we hydrate everything in one shot rather than round-tripping.
  hydrateLocalPlayer: (msg) =>
    set((state) => {
      const player = {
        id: msg.id,
        uuid: msg.uuid,
        name: msg.name,
        position: { x: msg.x, y: msg.y, z: msg.z },
        facing: msg.facing,
        skills: msg.skills,
        inventory: msg.inventory,
        equipment: defaultEquipment(),
        isMoving: false,
        pace: "walk" as const,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      };
      logger.game("Local player hydrated — id:", msg.id, "uuid:", msg.uuid);
      logger.game("HP:", maxHpFromSkills(msg.skills));
      const exists = state.nearbyPlayers.some((p) => p.id === msg.id);
      return {
        myId: msg.id,
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === msg.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  // Called when a player_join message arrives for someone else in range.
  // We don't have their skills/inventory — seed with defaults until the
  // server sends a dedicated state message for them (future work).
  registerPlayer: (msg) =>
    set((state) => {
      const player = {
        id: msg.player.id,
        uuid: "",
        name: msg.player.name,
        position: { x: msg.player.x, y: msg.player.y, z: msg.player.z },
        facing: msg.player.facing,
        skills: defaultSkills(),
        inventory: defaultInventory(),
        equipment: defaultEquipment(),
        isMoving: false,
        pace: "walk" as const,
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

  // Called on player_leave. The server sends the session ID directly —
  // no index registry needed since the new protocol uses id on every message.
  unregisterPlayer: (id) =>
    set((state) => {
      logger.game("Player unregistered — id:", id);
      return {
        nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id),
      };
    }),

  applyTick: ({ p }) =>
    set((state) => {
      // Build a Map for O(1) lookup per player rather than O(n*m) nested loops.
      const updates = new Map(
        p.map(([id, x, y, z, facing]) => [id, { position: { x, y, z }, facing, isMoving: true }]),
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
