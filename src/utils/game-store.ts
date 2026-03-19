import { create } from 'zustand';
import type { PlayerState, Position } from '../types/mmo';

interface GameState {
  myId: number | null;
  player: Position;
  nearbyPlayers: PlayerState[];
  wsConnected: boolean;
  setMyId: (id: number) => void;
  setPlayer: (pos: Position) => void;
  syncPlayers: (players: PlayerState[]) => void;
  setConnected: (connected: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  myId: null,
  player: { x: 0, y: 0 },
  nearbyPlayers: [],
  wsConnected: false,
  setMyId: (id) => set({ myId: id }),
  setPlayer: (pos) => set({ player: pos }),
  syncPlayers: (players) => set({ nearbyPlayers: players }),
  setConnected: (connected) => set({ wsConnected: connected }),
}));
