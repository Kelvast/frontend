import { ChunkData, TILES } from "mmo-shared";

const { G, D, S, W, N, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8, GD1, GD2, GD3, GD4, GD5, GD6, DI1, DI2, DI3, DD1, DD2, DD3, NI1, NI2, NI3, ND1, ND2, SI2, SI4, SD2, SD4 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    // Row 0 — flat plains
    [G, G, G, G, G, G, GI1, GI2, GI3, GI2, GI1, G, G, G, G, G],
    // Row 1 — slight eastern rise
    [G, G, G, G, GI1, GI2, GI3, GI4, GI5, GI4, GI3, GI2, GI1, G, G, G],
    // Row 2 — ridge line
    [G, G, GI1, GI2, GI3, GI5, GI6, GI7, GI8, GI7, GI6, GI4, GI2, GI1, G, G],
    // Row 3 — ridge peak, dirt track across
    [D, DI1, DI2, DI3, GI4, GI6, GI8, GI8, GI8, GI8, GI6, GI4, DI3, DI2, DI1, D],
    // Row 4 — east face descent
    [G, G, GI1, GI3, GI5, GI7, GI8, GI8, GI7, GI6, GI5, GI3, GI1, G, G, G],
    // Row 5 — approach to river
    [G, G, G, GI1, GI2, GI3, GI4, GI5, GI4, GI3, GI2, GI1, G, G, G, G],
    // Row 6 — river bank north, sand edges
    [G, G, G, G, GI1, GI1, NI1, NI2, NI3, NI2, NI1, G, G, G, G, G],
    // Row 7 — river
    [G, G, G, G, N, N, W, W, W, W, N, N, G, G, G, G],
    // Row 8 — river wide
    [G, G, G, N, N, W, W, W, W, W, W, N, N, G, G, G],
    // Row 9 — river south bank
    [G, G, G, G, ND1, ND2, W, W, W, W, ND1, ND2, G, G, G, G],
    // Row 10 — south bank decline to river bed
    [G, G, G, GD1, GD2, ND1, ND2, W, W, ND2, ND1, GD1, GD2, G, G, G],
    // Row 11 — stone ford crossing
    [G, G, GD1, GD2, GD3, GD2, SD2, SD4, SD4, SD2, GD2, GD3, GD2, GD1, G, G],
    // Row 12 — south plains begin
    [G, G, G, GD1, GD1, G, G, DD1, DD2, DD3, G, G, GD1, GD1, G, G],
    // Row 13 — open south fields
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
    // Row 14 — gentle dip south
    [G, G, GD1, GD1, GD2, GD1, G, G, G, G, GD1, GD2, GD1, GD1, G, G],
    // Row 15 — flat southern edge
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
