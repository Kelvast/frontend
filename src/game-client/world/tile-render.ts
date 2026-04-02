import { Color3 } from "@babylonjs/core";
import { TileHeight, TileData, TileType } from "mmo-shared";
import { HEIGHT_TINT, TILE_COLORS } from "./tile-colors";

export interface TileRenderConfig {
  color: Color3;
  textureId?: string;
  footstepSfx?: string;
}

function hexToColor3(hex: string): Color3 {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new Color3(r, g, b);
}

export function applyHeightTint(base: Color3, height: TileHeight): Color3 {
  const t = HEIGHT_TINT[height];
  return new Color3(Math.min(1, base.r * t), Math.min(1, base.g * t), Math.min(1, base.b * t));
}

export function getTileRenderConfig(tile: TileData): TileRenderConfig {
  const base = hexToColor3(TILE_COLORS[tile.type]);
  return { color: applyHeightTint(base, tile.y) };
}

export const TILE_RENDER: Record<TileType, TileRenderConfig> = Object.fromEntries(
  Object.entries(TILE_COLORS).map(([type, hex]) => [
    type,
    { color: hexToColor3(hex) } satisfies TileRenderConfig,
  ]),
) as Record<TileType, TileRenderConfig>;
