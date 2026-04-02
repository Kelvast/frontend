import { Color3 } from "@babylonjs/core";
import { Tile, TileType } from "mmo-shared";

/**
 * Client-only rendering config for each tile type.
 * color drives the Babylon material; walkable mirrors TILE_META for quick local checks.
 * Source of truth for walkability is TILE_META in mmo-shared — keep these in sync.
 */
export interface TileConfig {
  color: Color3;
}

export const TILE_CONFIG: Record<TileType, TileConfig> = {
  [Tile.Grass]: { color: new Color3(0.2, 0.6, 0.2) },
  [Tile.Dirt]:  { color: new Color3(0.55, 0.4, 0.25) },
  [Tile.Stone]: { color: new Color3(0.5, 0.5, 0.5) },
  [Tile.Water]: { color: new Color3(0.1, 0.3, 0.8) },
  [Tile.Sand]:  { color: new Color3(0.9, 0.8, 0.5) },
  [Tile.Wood]:  { color: new Color3(0.6, 0.45, 0.25) },
  [Tile.Road]:  { color: new Color3(0.6, 0.5, 0.3) },
};
