export interface ServerPlayer {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  pathLen: number;
  hp: number;
  facing: number;
}

declare global {
  interface WindowEventMap {
    "serverState": CustomEvent<ServerPlayer[]>;
    "loginSuccess": CustomEvent<number>;
  }
}
