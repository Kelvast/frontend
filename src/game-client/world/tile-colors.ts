import { Tile, TileHeight, TileType, TileData } from "mmo-shared";

/**
 * Hex colour strings for each tile type — the neutral baseline at GROUND level.
 * Used by the builder palette and any non-Babylon UI needing a representative colour.
 * For Babylon Color3 rendering use getTileRenderConfig in world/tile-render.ts.
 */
export const TILE_COLORS: Record<TileType, string> = {
  [Tile.Grass]: "#4a7c3f",
  [Tile.Dirt]: "#9b7040",
  [Tile.Stone]: "#7a7a72",
  [Tile.Water]: "#2a5fa8",
  [Tile.Sand]: "#c8b068",
  [Tile.Wood]: "#7a5230",
  [Tile.Road]: "#6b5e48",
};

/**
 * Brightness multipliers per height level.
 * Higher terrain catches more light (>1.0), lower terrain sits in shadow (<1.0).
 * Shared between the builder (hex tinting) and game renderer (Color3 tinting).
 */
export const HEIGHT_TINT: Record<TileHeight, number> = {
  [TileHeight.GROUND]: 1.0,
  [TileHeight.SLOPE_LOW]: 0.96,
  [TileHeight.SLOPE_LOW_MID]: 0.93,
  [TileHeight.SLOPE_MID]: 0.97,
  [TileHeight.SLOPE_MID_HIGH]: 1.03,
  [TileHeight.SLOPE_HIGH]: 1.07,
  [TileHeight.FIRST_FLOOR]: 1.12,
  [TileHeight.SECOND_FLOOR]: 1.16,
  [TileHeight.THIRD_FLOOR]: 1.2,
};

/** Applies a height-based brightness tint to a hex colour string. */
export function applyHeightTintHex(hex: string, y: TileHeight): string {
  const t = HEIGHT_TINT[y];
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * t));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * t));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Returns the tinted hex colour for a specific tile instance. */
export function getTileColor(tile: TileData): string {
  return applyHeightTintHex(TILE_COLORS[tile.type], tile.y);
}
