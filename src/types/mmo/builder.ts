import type { TileData } from "mmo-shared";

export interface BuilderChunk {
  regionId: string;
  chunkX: number;
  chunkZ: number;
  tiles: TileData[][];
  pvp: boolean;
}

export interface BuilderRegion {
  id: string;
  chunks: { chunkX: number; chunkZ: number }[];
}

export interface BuilderRegionsResponse {
  regions: BuilderRegion[];
}

export interface BuilderSaveRequest extends BuilderChunk {
  previousRegionId?: string;
}
