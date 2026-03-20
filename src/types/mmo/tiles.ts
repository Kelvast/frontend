// tile.ts
export interface Tile {
  walkable: boolean;
}

// chunk.ts
export interface Chunk {
  chunkX: number
  chunkY: number
  chunkZ: number
  tiles: Record<string, Tile>  // key: "x,y,z" local to chunk
}

// region.ts
export interface Region {
  id: string
  name: string
  chunks: Record<string, Chunk>  // key: "chunkX,chunkY,chunkZ"
  pvp: boolean
  spawnPoint: { x: number, y: number, z: number }
}

interface World {
  regions: Record<string, Region>  // key: region id
}
