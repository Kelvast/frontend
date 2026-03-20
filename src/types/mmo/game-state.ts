import { PlayerState } from "./player";

export interface GameStoreState {
  // State
  myId: string | null;
  player: PlayerState | null;
  nearbyPlayers: PlayerState[];
  worldTime: number;
  isConnected: boolean;
  latency: number;
  sessionToken:     string | null;
  sessionExpiresAt: number | null;

  // Actions
  setMyId: (id: string) => void;
  updatePlayer: (player: PlayerState) => void;
  setNearbyPlayers: (players: PlayerState[]) => void;
  addNearbyPlayer: (player: PlayerState) => void;
  removeNearbyPlayer: (id: string) => void;
  setConnected: (connected: boolean) => void;
  setLatency: (latency: number) => void;
  setSession: (session: { sessionToken: string; sessionExpiresAt: number }) => void;
}
