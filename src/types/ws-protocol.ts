import type { SkillName } from "./mmo/skills";

export interface LoginSuccessMsg {
  type: "login_success";
  index: number;
  id: string;
  x: number;
  y: number;
  z: number;
  skills: Record<SkillName, number>;
  sessionToken: string;
  sessionExpiresAt: number;
}

export interface RegisterSuccessMsg {
  type: "register_success";
}

export interface AuthFailMsg {
  type: "auth_fail";
  message: string;
}

export interface PlayerInitMsg {
  type: "player_init";
  index: number;
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
}

export interface PlayerLeaveMsg {
  type: "player_leave";
  index: number;
}

export type PlayerDelta = [number, number, number, number, number];

export interface TickMsg {
  type: "tick";
  t: number;
  p: PlayerDelta[];
}

export type ServerMsg =
  | LoginSuccessMsg
  | RegisterSuccessMsg
  | AuthFailMsg
  | PlayerInitMsg
  | TickMsg
  | PlayerLeaveMsg;
