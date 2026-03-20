import { PlayerState } from "./player";
import { Position } from "./position";

export type WSMessage =
  | { type: "init"; myId: string; players: PlayerState[] }
  | { type: "player_update"; playerId: string; position: Position }
  | { type: "player_join"; player: PlayerState }
  | { type: "player_leave"; playerId: string }
  | { type: "ping"; latency: number };

export type WSMessageType = WSMessage["type"];

export interface AuthResponse {
  token: string;
  userId: string;
}
