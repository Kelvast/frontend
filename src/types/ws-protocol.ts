export interface PlayerInitMsg {
  type?: "player_init"; // optional — only needed for WS routing
  index: number;
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
}

export interface PlayerLeaveMsg {
  type: "player_leave";
  index: number;
}

// Compact delta: [index, x, y, facing, hp]
export type PlayerDelta = [number, number, number, number, number];

export interface TickMsg {
  t: number; // server timestamp
  p: PlayerDelta[]; // only changed players
}
