import { ChunkData, TILES } from "kelvast-shared";

const { G, GD1, GI1, N, ND1, ND2, NI1, NI2, NI3, NI4, NI5, NI6, W, WD1, WD2, WI1 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [G, G, GI1, NI1, NI2, NI1, GI1, G, G, GI1, NI1, NI2, NI1, GI1, G, G],
    [G, GI1, NI2, NI3, NI4, NI3, NI3, GI1, GI1, NI3, NI3, NI4, NI3, NI2, GI1, G],
    [GI1, NI2, NI4, NI4, NI4, NI4, NI4, NI3, NI3, NI4, NI4, NI4, NI4, NI4, NI2, GI1],
    [NI1, NI3, NI4, NI2, NI2, NI2, NI2, NI2, NI2, NI2, NI2, NI2, NI4, NI4, NI3, NI1],
    [NI2, NI4, NI2, N, N, N, N, N, N, N, N, N, NI2, NI2, NI4, NI2],
    [NI2, NI3, NI1, N, N, ND1, ND2, W, W, ND2, ND1, N, N, NI2, NI4, NI2],
    [NI2, NI2, N, N, ND2, ND2, W, W, W, WD1, ND2, ND2, N, NI2, NI4, NI2],
    [NI1, NI2, N, ND2, ND2, W, W, W, W, W, WD2, ND2, ND1, NI1, NI3, NI1],
    [NI1, NI2, N, ND2, WD2, W, W, W, W, W, W, WD2, ND1, NI1, NI3, NI1],
    [NI1, NI2, NI2, N, N, W, W, W, W, W, W, N, N, NI2, NI3, NI1],
    [NI2, NI3, NI2, NI1, NI2, NI2, WI1, WD1, WD1, WI1, NI2, NI2, NI1, NI3, NI4, NI2],
    [NI2, NI4, NI4, NI3, NI4, NI4, NI3, NI1, NI1, NI3, NI4, NI4, NI3, NI5, NI4, NI2],
    [NI2, NI4, NI4, NI5, NI6, NI6, NI5, NI3, NI3, NI5, NI6, NI6, NI5, NI6, NI4, NI2],
    [NI1, NI3, NI3, NI4, NI5, NI5, NI5, NI4, NI4, NI5, NI4, NI4, NI4, NI4, NI3, NI1],
    [G, NI1, NI1, NI2, NI3, NI3, NI3, NI2, NI2, NI3, NI2, NI2, NI2, NI2, NI1, G],
    [GI1, GD1, ND1, N, NI1, NI1, NI1, GI1, GI1, NI1, N, N, N, N, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
