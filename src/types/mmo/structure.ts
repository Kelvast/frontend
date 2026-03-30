export enum WallType {
  NONE = "NONE",
  SOLID = "SOLID",
  WINDOW = "WINDOW",
  DOORWAY = "DOORWAY",
}

export enum DoorState {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface WallFace {
  type: WallType;
  door?: DoorState;
}

export interface WallConfig {
  north: WallFace;
  south: WallFace;
  east: WallFace;
  west: WallFace;
}

export interface Floor {
  walls: WallConfig;
  hasCeiling: boolean;
}

export interface Structure {
  floors: Floor[];
}

export function emptyWallFace(): WallFace {
  return { type: WallType.NONE };
}

export function emptyWallConfig(): WallConfig {
  return {
    north: emptyWallFace(),
    south: emptyWallFace(),
    east: emptyWallFace(),
    west: emptyWallFace(),
  };
}

export function emptyFloor(): Floor {
  return {
    walls: emptyWallConfig(),
    hasCeiling: false,
  };
}

export function emptyStructure(): Structure {
  return { floors: [emptyFloor()] };
}
