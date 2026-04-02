import { Color3 } from "@babylonjs/core";
import { Tile, TileType } from "mmo-shared";
import { TILE_COLORS } from "./tile-colors";

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

export const TILE_RENDER = Object.fromEntries(
  Object.entries(TILE_COLORS).map(([type, hex]) => [
    type,
    { color: hexToColor3(hex) } satisfies TileRenderConfig,
  ]),
) as Record<TileType, TileRenderConfig>;
