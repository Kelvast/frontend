import type { LoginSuccessMsg, PlayerJoinMsg, TickMsg } from "mmo-shared";
import type { PlayerState, NearbyPlayer } from "./player";
import type { UserSettings } from "./settings";

export interface GameStoreState {
  localPlayer: PlayerState | null;
  nearbyPlayers: NearbyPlayer[];
  worldTime: number;
  isConnected: boolean;
  latency: number;
  sessionToken: string | null;
  sessionExpiresAt: number | null;
  settings: UserSettings;

  setConnected: (connected: boolean) => void;
  setLatency: (latency: number) => void;
  setSession: (session: { sessionToken: string; sessionExpiresAt: number }) => void;
  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  hydrateLocalPlayer: (msg: LoginSuccessMsg) => void;
  registerPlayer: (msg: PlayerJoinMsg) => void;
  unregisterPlayer: (id: number) => void;
  applyTick: (msg: TickMsg) => void;
}
