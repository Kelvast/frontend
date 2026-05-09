import { ChunkData, TILES } from "kelvast-shared";

const { G, GD1, GD2, GD3, GD4, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [G, G, G, G, G, G, GI1, GI2, GI3, GI2, GI1, G, G, G, G, G],
    [G, G, G, G, GI1, GI3, GI4, GI5, GI6, GI5, GI4, GI2, GI1, G, G, G],
    [G, G, GI1, GI2, GI3, GI5, GI6, GI7, GI8, GI7, GI6, GI4, GI2, GI1, G, G],
    [G, GI1, GI2, GI3, GI4, GI6, GI7, GI8, GI8, GI7, GI6, GI4, GI3, GI2, GI1, G],
    [G, G, GI1, GI3, GI4, GI5, GI5, GI6, GI6, GI5, GI4, GI3, GI1, G, G, G],
    [G, G, G, GI1, GI2, GI3, GI3, GI4, GI4, GI3, GI2, GI1, G, G, G, G],
    [G, G, G, G, GI1, GI1, GI1, GI2, GI2, GI2, GI1, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, G, G, GD1, GD2, G, G, G, G, GD1, GD2, G, G, G, G],
    [G, G, G, GD1, GD2, GD1, GD2, GD2, GD2, GD2, GD1, GD1, GD2, G, G, G],
    [G, G, GD1, GD2, GD3, GD2, GD2, GD3, GD4, GD2, GD2, GD2, GD2, GD1, G, G],
    [G, G, G, GD1, GD1, G, G, GD1, GD2, GD2, G, G, GD1, GD1, G, G],
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    [G, G, GD1, GD1, G, GD1, G, G, G, G, GD1, G, GD1, GD1, G, G],
    [G, G, GI1, GI1, GI2, GI1, GI1, G, G, GI1, GI1, GI2, GI1, GI1, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
