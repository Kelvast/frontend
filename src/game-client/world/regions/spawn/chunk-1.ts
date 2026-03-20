import { ChunkData, tile, TileType, TileHeight } from "../../../../types";

const G = tile(TileType.GRASS);
const P = tile(TileType.PATH);
const W = tile(TileType.WATER);
const S = tile(TileType.STONE);
const D = tile(TileType.SAND);

// Elevated stone platform on the north-west corner
const SE = tile(TileType.STONE, TileHeight.FIRST_FLOOR);

export const spawnChunk1: ChunkData = {
  chunkX: 0,
  chunkZ: 0,
  region: "spawn",
  tiles: [
    [G, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, SE, SE, SE, SE, G, G, G, G, G, G, G, G, G, G],
    [G, G, SE, SE, SE, SE, G, G, G, G, G, W, W, W, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, W, W, W, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, W, W, W, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, G, D, D, D, D, G, G, G, G, G, G, G, G, G],
    [G, G, G, D, D, D, D, G, G, G, G, G, G, G, G, G],
    [G, G, G, D, D, D, D, G, G, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, S, S, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, S, S, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
};
