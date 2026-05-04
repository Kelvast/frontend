import { TileHeight, TileType, TileData, Floor } from "mmo-shared";

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
 * Brightness multiplier per TileHeight value.
 * Inclines brighten progressively (ascending = more light).
 * Declines darken progressively (descending = less light).
 * GROUND is neutral 1.0. Floor-level tinting is handled separately via FLOOR_TINT.
 */
export const HEIGHT_TINT: Record<TileHeight, number> = {
  [TileHeight.DECLINE_FULL]: 0.72,
  [TileHeight.DECLINE_SEVEN_EIGHTHS]: 0.75,
  [TileHeight.DECLINE_THREE_QUARTERS]: 0.78,
  [TileHeight.DECLINE_FIVE_EIGHTHS]: 0.81,
  [TileHeight.DECLINE_HALF]: 0.84,
  [TileHeight.DECLINE_THREE_EIGHTHS]: 0.87,
  [TileHeight.DECLINE_ONE_QUARTER]: 0.91,
  [TileHeight.DECLINE_ONE_EIGHTH]: 0.95,
  [TileHeight.GROUND]: 1.0,
  [TileHeight.INCLINE_ONE_EIGHTH]: 1.03,
  [TileHeight.INCLINE_ONE_QUARTER]: 1.06,
  [TileHeight.INCLINE_THREE_EIGHTHS]: 1.08,
  [TileHeight.INCLINE_HALF]: 1.1,
  [TileHeight.INCLINE_FIVE_EIGHTHS]: 1.12,
  [TileHeight.INCLINE_THREE_QUARTERS]: 1.14,
  [TileHeight.INCLINE_SEVEN_EIGHTHS]: 1.16,
  [TileHeight.INCLINE_FULL]: 1.18,
};

/*
 * Brightness multiplier per Floor value.
 * Upper floors brighten — elevated surfaces catch more light.
 * Dungeon floors darken — underground receives less ambient light.
 * Combined multiplicatively with HEIGHT_TINT in getTileColor.
 */
export const FLOOR_TINT: Record<Floor, number> = {
  [Floor.DUNGEON_VOID]: 0.5,
  [Floor.DUNGEON_DEEPEST]: 0.6,
  [Floor.DUNGEON_DEEPER]: 0.7,
  [Floor.DUNGEON_DEEP]: 0.82,
  [Floor.GROUND]: 1.0,
  [Floor.FIRST]: 1.12,
  [Floor.SECOND]: 1.16,
  [Floor.THIRD]: 1.2,
};

export function applyHeightTintHex(hex: string, tint: number): string {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * tint));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * tint));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * tint));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function getTileColor(tile: TileData): string {
  const slopeTint = HEIGHT_TINT[tile.y];
  const floorTint = FLOOR_TINT[tile.floor];
  return applyHeightTintHex(TILE_COLORS[tile.type], slopeTint * floorTint);
}
