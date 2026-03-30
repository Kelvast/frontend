import { TileType } from "../types";

export const TILE_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: "#336633",
  [TileType.WATER]: "#1a4dcc",
  [TileType.STONE]: "#808080",
  [TileType.SAND]: "#e6cc80",
  [TileType.PATH]: "#997a4d",
};
