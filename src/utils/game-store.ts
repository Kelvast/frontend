import { create } from "zustand";
import { GameStoreState, PlayerState } from "../types";

export const useGameStore = create<GameStoreState>((set, get) => ({
  // State
  myId: null,
  player: null,
  nearbyPlayers: [],
  worldTime: 0,
  isConnected: false,
  latency: 0,

  // Actions
  setMyId: (id: string) => set({ myId: id }),
  updatePlayer: (player: PlayerState) => set({ player }),
  setNearbyPlayers: (players: PlayerState[]) => set({ nearbyPlayers: players }),
  addNearbyPlayer: (player: PlayerState) =>
    set((state) => ({
      nearbyPlayers: [...state.nearbyPlayers.filter((p) => p.id !== player.id), player],
    })),
  removeNearbyPlayer: (id: string) =>
    set((state) => ({
      nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id),
    })),
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setLatency: (latency: number) => set({ latency }),
}));
