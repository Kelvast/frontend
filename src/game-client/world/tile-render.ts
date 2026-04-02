import { Color3 } from "@babylonjs/core";
import { Tile, TileType } from "mmo-shared";

/**
 * Client-only rendering config for each tile type.
 * Keeps Babylon and visual concerns out of mmo-shared.
 *
 * color       — Babylon diffuse colour used until texture atlases are implemented.
 * textureId   — future: atlas key e.g. "grass_01"; undefined until atlas system exists.
 * footstepSfx — future: audio category played when a player walks on this tile.
 */
export interface TileRenderConfig {
  color: Color3;
  textureId?: string;
  footstepSfx?: string;
}

export const TILE_RENDER: Record<TileType, TileRenderConfig> = {
  [Tile.Grass]: { color: new Color3(0.2,  0.6,  0.2)  },
  [Tile.Dirt]:  { color: new Color3(0.55, 0.4,  0.25) },
  [Tile.Stone]: { color: new Color3(0.5,  0.5,  0.5)  },
  [Tile.Water]: { color: new Color3(0.1,  0.3,  0.8)  },
  [Tile.Sand]:  { color: new Color3(0.9,  0.8,  0.5)  },
  [Tile.Wood]:  { color: new Color3(0.6,  0.45, 0.25) },
  [Tile.Road]:  { color: new Color3(0.6,  0.5,  0.3)  },
};
