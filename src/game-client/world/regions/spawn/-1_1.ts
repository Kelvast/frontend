import { ChunkData, TILES } from "kelvast-shared";

const { G, GD1, GD2, GD3, GI1, GI2, GI3, GI4, GI5, N, ND1, ND2, ND3, ND5, NI1, NI2, NI3, NI4, NI8, W, WI2, WI3, WI4, WI5, WI6 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ND2, ND2, G, G, G, G, G, G, G, G, G, NI2, NI2, NI2, NI8, N],
    [G, G, NI2, GI2, NI2, NI1, NI1, N, NI2, NI2, NI2, GI4, GI4, GI4, GI2, N],
    [G, G, GI1, NI3, GI3, GI3, GI2, GI1, GI3, GI3, NI4, NI3, NI2, NI2, G, NI1],
    [G, G, GI1, GI3, NI4, GI5, GI3, NI2, GI4, NI2, NI2, NI1, G, G, N, NI2],
    [G, G, G, GI2, NI2, NI4, NI3, NI3, NI4, GI2, G, N, G, G, NI1, NI3],
    [G, G, ND1, G, G, NI2, WI2, WI2, WI2, WI2, WI2, WI2, WI2, WI2, GI2, NI4],
    [G, GI1, NI1, G, G, WI2, WI2, WI2, WI2, WI2, WI2, WI3, WI3, WI2, WI4, NI4],
    [G, NI2, NI1, NI1, G, WI2, G, WI2, WI2, WI2, WI3, WI5, WI5, WI4, WI5, NI3],
    [NI2, G, GI1, NI1, NI1, WI2, WI2, WI2, WI2, WI3, WI5, WI6, WI4, WI4, NI4, NI2],
    [NI2, G, G, GI1, NI2, WI2, WI2, GI1, WI3, WI5, WI5, WI5, WI4, WI5, NI3, NI1],
    [G, G, G, G, G, G, WI2, NI3, WI3, WI5, WI5, WI5, WI6, WI4, NI2, N],
    [G, GI1, GI1, G, G, G, WI2, WI2, WI3, WI4, WI5, WI5, WI5, WI3, NI2, N],
    [G, NI1, NI1, GI1, GI1, G, GI1, WI2, WI2, WI4, WI4, WI4, WI3, NI1, NI2, N],
    [G, GD1, GD1, ND1, ND1, GI1, NI2, WI2, WI2, WI2, NI2, NI2, NI1, ND1, NI1, N],
    [ND2, ND3, GD3, GD3, GD3, ND1, N, W, W, W, G, N, ND1, ND3, ND1, N],
    [GD2, ND5, ND5, ND5, ND5, GD2, ND2, ND2, ND2, ND2, ND2, ND2, N, ND5, N, N],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
