import { ChunkData, tile, TileType, TileHeight } from "../../../../types";

const G = tile(TileType.GRASS);
const S = tile(TileType.STONE);

export default {
  pvp: false,
  tiles: [
    [G, S, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, S, G, G, G, S, S, G, G, G, S, S, G, G, G, G],
    [G, S, G, G, G, S, G, G, S, S, G, S, G, G, G, G],
    [G, S, G, G, G, G, S, S, G, S, G, S, G, G, G, G],
    [G, S, S, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, S, G, G, G, G, G, G, G, G, S, G, G, G, G],
    [G, G, S, S, G, G, S, G, G, S, G, G, G, G, G, G],
    [G, G, G, S, S, S, S, G, G, G, G, G, G, G, G, G],
    [G, G, G, S, S, G, G, G, G, G, G, G, S, G, G, G],
    [G, G, G, G, S, S, S, G, S, G, G, G, G, G, G, G],
    [G, G, G, G, G, S, S, S, G, G, G, G, S, G, G, G],
    [G, G, G, G, G, G, G, S, G, G, G, G, G, G, G, G],
    [G, G, G, G, G, S, G, S, S, G, G, G, G, G, G, G],
    [G, G, G, G, G, S, G, G, S, S, S, G, G, G, G, G],
    [G, G, G, G, S, G, G, G, S, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
