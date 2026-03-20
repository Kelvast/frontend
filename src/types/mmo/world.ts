export enum TileType {
  GRASS = "GRASS",
  WATER = "WATER",
  STONE = "STONE",
  SAND = "SAND",
  PATH = "PATH",
}

export const TileHeight = {
  GROUND: 0,
  SLOPE_LOW: 0.25,
  SLOPE_MID: 0.5,
  SLOPE_HIGH: 0.75,
  FIRST_FLOOR: 1,
  SECOND_FLOOR: 2,
  THIRD_FLOOR: 3,
} as const;

export type TileHeight = (typeof TileHeight)[keyof typeof TileHeight];

export const TILE_WALKABLE: Record<TileType, boolean> = {
  [TileType.GRASS]: true,
  [TileType.WATER]: false,
  [TileType.STONE]: true,
  [TileType.SAND]: true,
  [TileType.PATH]: true,
};

export interface Tile {
  type: TileType;
  y: TileHeight;
}

export const tile = (type: TileType, y: TileHeight = TileHeight.GROUND): Tile => ({ type, y });

export interface ChunkData {
  chunkX: number;
  chunkZ: number;
  region: string;
  tiles: Tile[][]; // [row][col] — 16×16
}

export interface Region {
  id: string;
  name: string;
  pvp: boolean;
  chunks: Record<string, ChunkData>; // key: "chunkX,chunkZ"
}

export interface World {
  regions: Record<string, Region>; // key: region id
}
