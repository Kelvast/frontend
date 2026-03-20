import { ChunkData, tile, TileType } from "../../../../types";

const G = tile(TileType.GRASS);
const P = tile(TileType.PATH);
const W = tile(TileType.WATER);
const S = tile(TileType.STONE);
const D = tile(TileType.SAND);

export const spawnChunk1: ChunkData = {
  chunkX: 0,
  chunkZ: 0,
  region: "spawn",
  tiles: [
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, S, S, S, S, G, G, G, G, G, G, G, G, G, G],
    [G, G, S, S, S, S, G, G, G, G, G, W, W, W, G, G],
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
