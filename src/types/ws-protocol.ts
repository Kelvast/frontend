export interface LoginSuccessMsg {
  type: "login_success";
  index: number;
  id: string;
  x: number;
  y: number;
  z: number;
  hp: number;
  sessionToken: string;
  sessionExpiresAt: number;
}

export interface PlayerInitMsg {
  type?: "player_init";
  index: number;
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  z: number;
}

export interface PlayerLeaveMsg {
  type: "player_leave";
  index: number;
}

export interface AuthFailMsg {
  type: "auth_fail";
  message: string;
}

// Compact delta: [index, x, y, z, facing, hp]
export type PlayerDelta = [number, number, number, number, number, number];

export interface TickMsg {
  type: "tick";
  t: number;
  p: PlayerDelta[];
}
