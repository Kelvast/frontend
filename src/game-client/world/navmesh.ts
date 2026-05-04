import { ChunkData, TileData, TileHeight, Floor, TILE_WALKABLE, WORLD } from "mmo-shared";
import { tileWorldY, floorWorldY } from "./tile-height";

export interface NavNode {
  x: number;
  z: number;
  y: TileHeight;
  floor: Floor;
  worldY: number;
  walkable: boolean;
  blockedEdges: number;
}

export type Navmesh = Map<string, NavNode>;

export function navKey(x: number, z: number): string {
  return `${x},${z}`;
}

export function buildChunkNavmesh(chunk: ChunkData): Map<string, NavNode> {
  const nodes: Map<string, NavNode> = new Map();
  const { chunkX, chunkZ, tiles } = chunk;

  for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
    for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
      const tile: TileData = tiles[row][col];
      const tileX = chunkX * WORLD.CHUNK_SIZE + col;
      const tileZ = chunkZ * WORLD.CHUNK_SIZE + row;
      const worldY = floorWorldY(tile.floor) + tileWorldY(tile.y);

      nodes.set(navKey(tileX, tileZ), {
        x: tileX,
        z: tileZ,
        y: tile.y,
        floor: tile.floor,
        worldY,
        walkable: TILE_WALKABLE[tile.type],
        blockedEdges: tile.blockedEdges,
      });
    }
  }

  return nodes;
}

/*
 * Writes all nodes from incoming into target.
 * Called on every chunk load and reload — stale nodes are overwritten in place.
 */
export function mergeNavmesh(target: Navmesh, incoming: Map<string, NavNode>): void {
  for (const [key, node] of incoming) {
    target.set(key, node);
  }
}
