import { PlayerInitMsg, TickMsg } from "../ws-protocol";
import { PlayerState } from "./player";

export interface GameStoreState {
  // State
  myId: string | null;
  player: PlayerState | null;
  nearbyPlayers: PlayerState[];
  worldTime: number;
  isConnected: boolean;
  latency: number;
  sessionToken: string | null;
  sessionExpiresAt: number | null;
  indexRegistry: Map<number, string>;

  // Actions
  setMyId: (id: string) => void;
  updatePlayer: (player: PlayerState) => void;
  setConnected: (connected: boolean) => void;
  setLatency: (latency: number) => void;
  setSession: (session: { sessionToken: string; sessionExpiresAt: number }) => void;
  registerPlayer: (msg: PlayerInitMsg) => void;
  unregisterPlayer: (index: number) => void;
  applyTick: (msg: TickMsg) => void;
}
