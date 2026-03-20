import { create } from "zustand";
import { GameStoreState, PlayerState } from "../types";
import { UserSettings } from "../types/mmo/settings";
import { loadSettings, patchSettings } from "./settings";
import { logger } from "./logger";
import { defaultSkills, skillFromXp } from "../types/mmo/skills";
import { maxHpFromSkills } from "./xp";

export const useGameStore = create<GameStoreState>((set) => ({
  myId: null,
  nearbyPlayers: [],
  worldTime: 0,
  isConnected: false,
  latency: 0,
  sessionToken: null,
  sessionExpiresAt: null,
  indexRegistry: new Map(),
  settings: loadSettings(),

  setMyId: (id: string) => {
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

  hydrateLocalPlayer: (msg) =>
    set((state) => {
      const skills = Object.fromEntries(
        Object.entries(msg.skills).map(([name, xp]) => [name, skillFromXp(xp as number)]),
      ) as ReturnType<typeof defaultSkills>;
      const player: PlayerState = {
        id: msg.id,
        name: "",
        position: { x: msg.x, y: msg.y, z: msg.z },
        facing: 0,
        isMoving: false,
        pace: "walk",
        lastUpdated: Date.now(),
        animationState: "idle",
        stats: {
          level: 1,
          experience: 0,
          currentHp: maxHpFromSkills(skills.hitpoints.level),
          mana: 0,
          maxMana: 0,
          skills,
        },
      };
      logger.game("Local player hydrated — id:", msg.id);
      const exists = state.nearbyPlayers.some((p) => p.id === msg.id);
      return {
        myId: msg.id,
        indexRegistry: new Map(state.indexRegistry).set(msg.index, msg.id),
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === msg.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  registerPlayer: (msg) =>
    set((state) => {
      const registry = new Map(state.indexRegistry);
      registry.set(msg.index, msg.id);
      const skills = defaultSkills();
      const player: PlayerState = {
        id: msg.id,
        name: msg.name,
        position: { x: msg.x, y: msg.y, z: msg.z },
        facing: 0,
        isMoving: false,
        pace: "walk",
        lastUpdated: Date.now(),
        animationState: "idle",
        stats: {
          level: 1,
          experience: 0,
          currentHp: maxHpFromSkills(skills.hitpoints.level),
          mana: 0,
          maxMana: 0,
          skills,
        },
      };
      logger.game("Player registered — index:", msg.index, "id:", msg.id);
      const exists = state.nearbyPlayers.some((p) => p.id === msg.id);
      return {
        indexRegistry: registry,
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === msg.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  unregisterPlayer: (index) =>
    set((state) => {
      const id = state.indexRegistry.get(index);
      const registry = new Map(state.indexRegistry);
      registry.delete(index);
      logger.game("Player unregistered — index:", index, "id:", id);
      return {
        indexRegistry: registry,
        nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id),
      };
    }),

  applyTick: ({ p }) =>
    set((state) => {
      const updates = new Map(
        p.map(([idx, x, y, z, facing]) => {
          const id = state.indexRegistry.get(idx);
          return [id, { position: { x, y, z }, facing, isMoving: true }];
        }),
      );
      return {
        nearbyPlayers: state.nearbyPlayers.map((player) => {
          const delta = updates.get(player.id);
          if (!delta) return { ...player };
          return {
            ...player,
            ...delta,
            lastUpdated: Date.now(),
          };
        }),
      };
    }),
}));
