import { Color3 } from '@babylonjs/core';
import { TileType } from '../../types/mmo/world';

export interface TileConfig {
  color: Color3;
  walkable: boolean;
}

export const TILE_CONFIG: Record<TileType, TileConfig> = {
  [TileType.GRASS]: { color: new Color3(0.2, 0.6, 0.2), walkable: true  },
  [TileType.WATER]: { color: new Color3(0.1, 0.3, 0.8), walkable: false },
  [TileType.STONE]: { color: new Color3(0.5, 0.5, 0.5), walkable: true  },
  [TileType.SAND]:  { color: new Color3(0.9, 0.8, 0.5), walkable: true  },
  [TileType.PATH]:  { color: new Color3(0.6, 0.5, 0.3), walkable: true  },
};
