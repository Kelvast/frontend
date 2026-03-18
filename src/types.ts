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

// Tell TypeScript about our custom events
declare global {
  interface WindowEventMap {
    serverState: CustomEvent<ServerPlayer[]>;
  }
}
