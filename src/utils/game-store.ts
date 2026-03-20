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
  sessionToken:     null,
  sessionExpiresAt: null,

  setMyId: (id: string) => {
    logger.game("My ID set:", id);
    set({ myId: id });
  },

  updatePlayer: (player) => {
    set((state) => {
      const exists = state.nearbyPlayers.some(p => p.id === player.id);
      const nearbyPlayers = exists
        ? state.nearbyPlayers.map(p => p.id === player.id ? { ...p, ...player } : p)
        : [...state.nearbyPlayers, player];
      logger.game("Local player updated:", player.name ?? player.id);
      return { nearbyPlayers };
    });
  },

  setNearbyPlayers: (players: PlayerState[]) => {
    logger.game("Nearby players synced:", players.length);
    set({ nearbyPlayers: players });
  },

  addNearbyPlayer: (player: PlayerState) => {
    logger.game("Player entered range:", player.id);
    set((state) => ({
      nearbyPlayers: [...state.nearbyPlayers.filter((p) => p.id !== player.id), player],
    }));
  },

  removeNearbyPlayer: (id: string) => {
    logger.game("Player left range:", id);
    set((state) => ({
      nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id),
    }));
  },

  setConnected: (connected: boolean) => {
    logger.game("Connection state:", connected ? "connected" : "disconnected");
    set({ isConnected: connected });
  },

  setLatency: (latency: number) => set({ latency }),

  setSession: ({ sessionToken, sessionExpiresAt }) => {
    logger.game('Session stored, expires:', new Date(sessionExpiresAt).toISOString());
    set({ sessionToken, sessionExpiresAt });
  },
}));
