import { TileHeight, TileType, TileData } from "mmo-shared";

export const TILE_COLORS: Record<TileType, string> = {
  grass: "#4a7c3f",
  dirt: "#9b7040",
  stone: "#7a7a72",
  water: "#2a5fa8",
  sand: "#c8b068",
  wood: "#7a5230",
  road: "#6b5e48",
};

/*
 * Brightness multiplier per slope height.
 * Only covers TileHeight slope values - floor tinting is applied separately
 * via tile.floor, not tile.y, since floor is now its own axis.
 */
export const HEIGHT_TINT: Record<TileHeight, number> = {
  [TileHeight.GROUND]: 1.0,
  [TileHeight.SLOPE_LOW]: 0.96,
  [TileHeight.SLOPE_LOW_MID]: 0.93,
  [TileHeight.SLOPE_MID]: 0.97,
  [TileHeight.SLOPE_MID_HIGH]: 1.03,
  [TileHeight.SLOPE_HIGH]: 1.07,
};

/*
 * Floor tint brightens tiles on upper floors so they read as elevated.
 */
export const FLOOR_TINT: Record<number, number> = {
  0: 1.0,
  1: 1.12,
  2: 1.16,
  3: 1.2,
};

export function applyHeightTintHex(hex: string, tint: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * tint));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * tint));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * tint));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function getTileColor(tile: TileData): string {
  const slopeTint = HEIGHT_TINT[tile.y];
  const floorTint = FLOOR_TINT[tile.floor] ?? 1.0;
  return applyHeightTintHex(TILE_COLORS[tile.type], slopeTint * floorTint);
}
