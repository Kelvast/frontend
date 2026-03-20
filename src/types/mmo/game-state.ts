import { PlayerState } from './player';

export interface GameState {
  myId: string | null;
  player: PlayerState | null;
  nearbyPlayers: PlayerState[];
  worldTime: number;
  isConnected: boolean;
  latency: number;
}

// Store Actions (for Zustand)
export interface GameActions {
  setMyId: (id: string) => void;
  updatePlayer: (player: PlayerState) => void;
  setNearbyPlayers: (players: PlayerState[]) => void;
  addNearbyPlayer: (player: PlayerState) => void;
  removeNearbyPlayer: (id: string) => void;
  setConnected: (connected: boolean) => void;
  setLatency: (latency: number) => void;
}

export type GameStoreState = GameState & GameActions;
