import { ChunkData, tile, TileType, TileHeight } from "../../../../types";

const G = tile(TileType.GRASS);
const P = tile(TileType.PATH);
const W = tile(TileType.WATER);
const S = tile(TileType.STONE);
const D = tile(TileType.SAND);
const SE = tile(TileType.STONE, TileHeight.FIRST_FLOOR);

export default {
  pvp: false,
  tiles: [
    [G, G, G, G, G, G, P, P, G, G, G, G, G, G, G, G],
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
    [G, G, G, D, D, D, D, P, P, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, S, S, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, S, S, G, G, G, G],
    [G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
