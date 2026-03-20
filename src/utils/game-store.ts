import { create } from "zustand";
import { GameStoreState, PlayerState } from "../types";
import { logger } from "./logger";

export const useGameStore = create<GameStoreState>((set, get) => ({
  myId: null,
  player: null,
  nearbyPlayers: [],
  worldTime: 0,
  isConnected: false,
  latency: 0,
  sessionToken: null,
  sessionExpiresAt: null,
  indexRegistry: new Map(),

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

  // Used only for the local player hydration from the `state` tick
  updatePlayer: (player) =>
    set((state) => {
      const exists = state.nearbyPlayers.some((p) => p.id === player.id);
      logger.game("Local player updated:", player.id);
      return {
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === player.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  registerPlayer: (msg) =>
    set((state) => {
      const registry = new Map(state.indexRegistry);
      registry.set(msg.index, msg.id);
      const exists = state.nearbyPlayers.some((p) => p.id === msg.id);
      const player: PlayerState = {
        id: msg.id,
        name: msg.name,
        position: { x: msg.x, y: 0, z: msg.y },
        facing: 0,
        isMoving: false,
        lastUpdated: Date.now(),
        animationState: "idle",
        stats: {
          health: msg.hp,
          maxHealth: msg.maxHp,
          level: 1,
          experience: 0,
          mana: 0,
          maxMana: 0,
        },
      };
      logger.game("Player registered — index:", msg.index, "id:", msg.id);
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

  applyTick: ({ t, p }) =>
    set((state) => {
      const updates = new Map(
        p.map(([idx, x, y, facing, hp]) => {
          const id = state.indexRegistry.get(idx);
          return [id, { position: { x, y: 0, z: y }, facing, isMoving: x !== 0 || y !== 0, hp }];
        }),
      );
      return {
        nearbyPlayers: state.nearbyPlayers.map((player) => {
          const delta = updates.get(player.id);
          if (!delta) return player;
          const { hp, ...rest } = delta;
          return {
            ...player,
            ...rest,
            lastUpdated: Date.now(),
            stats: { ...player.stats, health: hp },
          };
        }),
      };
    }),
}));
