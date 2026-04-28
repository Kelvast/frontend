import type { LoginSuccessMessage, PlayerJoinMessage, TickMessage, GameSession } from "mmo-shared";
import type { AuthSuccessResponse } from "mmo-shared";
import type { PlayerState, NearbyPlayer } from "./player";
import type { UserSettings } from "./settings";

export interface GameStoreState {
  localPlayer: PlayerState | null;
  nearbyPlayers: NearbyPlayer[];
  worldTime: number;
  isConnected: boolean;
  latency: number;
  gameSessionToken: string | null;
  gameSessionExpiresAt: number | null;
  settings: UserSettings;

  setConnected: (connected: boolean) => void;
  setLatency: (latency: number) => void;
  setSession: (session: GameSession) => void;
  setLocalPlayer: (response: AuthSuccessResponse) => void;
  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  hydrateLocalPlayer: (msg: LoginSuccessMessage) => void;
  registerPlayer: (msg: PlayerJoinMessage) => void;
  unregisterPlayer: (id: number) => void;
  applyTick: (msg: TickMessage) => void;
}
