import { ChunkData, TileData, TileHeight, Floor, TILE_WALKABLE, WORLD } from "kelvast-shared";
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

/*
 * Returns the blended centre worldY for a tile — the average of the four
 * corner blends used by tile-mesh.ts to build the visual geometry.
 *
 * Each corner averages the tile itself + up to 3 neighbours (clamped at
 * chunk edge). Averaging all four corners collapses to the average of the
 * tile's own height + its four cardinal + four diagonal neighbours, weighted
 * by how many corners each contributes to. For the centre point this is
 * equivalent to the mean of all contributing samples, which matches the
 * visual mesh surface centre exactly.
 *
 * This must stay in sync with cornerY() in tile-mesh.ts. Both use the same
 * 4-sample average per corner, 4 corners per tile.
 */
function tileBlendedWorldY(tiles: TileData[][], row: number, col: number): number {
  const rows = tiles.length;
  const cols = tiles[0].length;

  function clampedY(r: number, c: number): number {
    const cr = Math.max(0, Math.min(rows - 1, r));
    const cc = Math.max(0, Math.min(cols - 1, c));
    return tileWorldY(tiles[cr][cc].y);
  }

  /*
   * Four corners, each averaged from the same 4-sample neighbourhood as
   * cornerY() in tile-mesh.ts.
   */
  const corners = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ] as const;

  let sum = 0;
  for (const [dr, dc] of corners) {
    const corner =
      (clampedY(row, col) +
        clampedY(row + dr, col) +
        clampedY(row, col + dc) +
        clampedY(row + dr, col + dc)) /
      4;
    sum += corner;
  }

  return sum / 4;
}

export function buildChunkNavmesh(chunk: ChunkData): Map<string, NavNode> {
  const nodes: Map<string, NavNode> = new Map();
  const { chunkX, chunkZ, tiles } = chunk;

  for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
    for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
      const tile: TileData = tiles[row][col];
      const tileX = chunkX * WORLD.CHUNK_SIZE + col;
      const tileZ = chunkZ * WORLD.CHUNK_SIZE + row;

      /*
       * worldY uses the blended centre height — identical to what tile-mesh.ts
       * renders. Pickable planes and player Y position now sit on the visual surface.
       */
      const worldY = floorWorldY(tile.floor) + tileBlendedWorldY(tiles, row, col);

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
