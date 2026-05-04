import { ChunkData, TILES } from "mmo-shared";

const { G, D, S, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8, GD1, GD2, GD3, GD4, SI1, SI2, SI3, SI4, SI5, SI6, SI7, SI8, SD1, SD2, SD3, SD4, SD5, SD6, DI1, DI2, DI3, DI4, DD1, DD2, DD3 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    // Row 0 — mountain base north
    [G, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI6, GI5, GI4, GI3, GI2, GI1, G, G],
    // Row 1 — steep ascent
    [GI1, GI3, GI5, GI7, GI8, SI1, SI2, SI3, SI2, SI1, GI8, GI7, GI5, GI3, GI1, G],
    // Row 2 — stone face
    [GI2, GI5, GI8, SI2, SI4, SI6, SI8, SI8, SI8, SI6, SI4, SI2, GI8, GI5, GI2, GI1],
    // Row 3 — upper mountain
    [GI3, GI6, SI1, SI3, SI6, SI8, SI8, SI8, SI8, SI8, SI6, SI3, SI1, GI6, GI3, GI1],
    // Row 4 — pass entrance, dirt trail
    [GI4, GI7, SI2, SI5, SI8, D, DI1, DI2, DI1, D, SI8, SI5, SI2, GI7, GI4, GI2],
    // Row 5 — pass narrows
    [GI5, GI8, SI3, SI8, D, DI2, DI3, DI4, DI3, DI2, D, SI8, SI3, GI8, GI5, GI2],
    // Row 6 — pass floor
    [GI5, GI8, SI4, SI8, DI1, DI3, DI4, DI4, DI4, DI3, DI1, SI8, SI4, GI8, GI5, GI3],
    // Row 7 — pass centre
    [GI4, GI7, SI5, SI8, DI2, DI4, D, D, D, DI4, DI2, SI8, SI5, GI7, GI4, GI2],
    // Row 8 — pass south exit begins
    [GI3, GI6, SI4, SI8, DI1, DI3, DI4, DI4, DI4, DI3, DI1, SI8, SI4, GI6, GI3, GI1],
    // Row 9 — south face descent
    [GI2, GI5, SI3, SI6, SI8, DD1, DD2, DD3, DD2, DD1, SI8, SI6, SI3, GI5, GI2, GI1],
    // Row 10 — stone gives way to grass
    [GI1, GI3, GI6, SI2, SI5, SI8, SD1, SD2, SD1, SI8, SI5, SI2, GI6, GI3, GI1, G],
    // Row 11 — lower south slope
    [G, GI2, GI4, GI7, SI1, SI4, SI7, SD3, SI7, SI4, SI1, GI7, GI4, GI2, G, G],
    // Row 12 — foothills
    [G, GI1, GI3, GI5, GI8, SI1, SI3, SD4, SI3, SI1, GI8, GI5, GI3, GI1, G, G],
    // Row 13 — gentle slope out
    [G, G, GI2, GI4, GI6, GI8, GI7, SD5, GI7, GI8, GI6, GI4, GI2, G, G, G],
    // Row 14 — almost flat
    [G, G, GI1, GI2, GI4, GI5, GI4, GD1, GI4, GI5, GI4, GI2, GI1, G, G, G],
    // Row 15 — flat southern border
    [G, G, G, GI1, GI2, GI3, GI2, G, GI2, GI3, GI2, GI1, G, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
