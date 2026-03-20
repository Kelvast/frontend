import { PlayerState } from './player';

export interface GameState {
  myId: string | null;
  player: PlayerState | null;
  nearbyPlayers: PlayerState[];
  worldTime: number;
  isConnected: boolean;
  latency: number;
}
