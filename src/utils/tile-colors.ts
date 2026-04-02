import { Tile, TileType } from "mmo-shared";

/**
 * Hex color strings for each tile type.
 * Used by the builder grid and any non-Babylon UI that needs tile colours.
 * For Babylon scene rendering use TILE_CONFIG in world/tile-config.ts instead.
 */
export const TILE_COLORS: Record<TileType, string> = {
  [Tile.Grass]: "#336633",
  [Tile.Dirt]:  "#8c6640",
  [Tile.Stone]: "#808080",
  [Tile.Water]: "#1a4dcc",
  [Tile.Sand]:  "#e6cc80",
  [Tile.Wood]:  "#996633",
  [Tile.Road]:  "#997a4d",
};
