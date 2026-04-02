import { TileHeight, TileType, TileData } from "mmo-shared";

export const TILE_COLORS: Record<TileType, string> = {
  grass: "#4a7c3f",
  dirt:  "#9b7040",
  stone: "#7a7a72",
  water: "#2a5fa8",
  sand:  "#c8b068",
  wood:  "#7a5230",
  road:  "#6b5e48",
};

export const HEIGHT_TINT: Record<TileHeight, number> = {
  [TileHeight.GROUND]:         1.0,
  [TileHeight.SLOPE_LOW]:      0.96,
  [TileHeight.SLOPE_LOW_MID]:  0.93,
  [TileHeight.SLOPE_MID]:      0.97,
  [TileHeight.SLOPE_MID_HIGH]: 1.03,
  [TileHeight.SLOPE_HIGH]:     1.07,
  [TileHeight.FIRST_FLOOR]:    1.12,
  [TileHeight.SECOND_FLOOR]:   1.16,
  [TileHeight.THIRD_FLOOR]:    1.2,
};

export function applyHeightTintHex(hex: string, y: TileHeight): string {
  const t = HEIGHT_TINT[y];
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * t));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * t));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function getTileColor(tile: TileData): string {
  return applyHeightTintHex(TILE_COLORS[tile.type], tile.y);
}
