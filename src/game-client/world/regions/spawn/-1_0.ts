import { ChunkData, TILES } from "mmo-shared";

const { G, S, W, N, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8, GD1, GD2, GD3, GD4, GD5, GD6, SI1, SI2, SI3, SI4, SI5, SI6, SI7, SI8, SD1, SD2, SD3, SD4, SD5, SD6, SD7, SD8, NI1, NI2, NI3, ND1, ND2, ND3 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    // Row 0 — clifftop, grassy
    [G, G, G, G, G, G, GI1, GI2, GI1, G, G, G, G, G, G, G],
    // Row 1 — clifftop with stone edge
    [G, G, G, G, GI1, GI2, GI3, GI4, GI3, GI2, GI1, G, G, G, G, G],
    // Row 2 — cliff brow
    [G, G, GI1, GI3, GI5, GI7, GI8, GI8, GI8, GI7, GI5, GI3, GI1, G, G, G],
    // Row 3 — upper cliff face, stone
    [G, GI2, GI5, GI8, SI1, SI3, SI5, SI7, SI5, SI3, SI1, GI8, GI5, GI2, G, G],
    // Row 4 — cliff face
    [GI1, GI4, GI8, SI2, SI4, SI6, SI8, SI8, SI8, SI6, SI4, SI2, GI8, GI4, GI1, G],
    // Row 5 — sheer drop
    [GI2, GI6, SI1, SI4, SI7, SI8, SI8, SI8, SI8, SI8, SI7, SI4, SI1, GI6, GI2, G],
    // Row 6 — cliff base, sand appears
    [GI3, GI7, SI2, SI5, SI8, SI8, SD1, SD2, SD1, SI8, SI8, SI5, SI2, GI7, GI3, GI1],
    // Row 7 — beach emerges
    [GI4, GI8, SI3, SI6, SD1, SD3, SD5, SD7, SD5, SD3, SD1, SI6, SI3, GI8, GI4, GI2],
    // Row 8 — lower beach
    [GI4, GI8, SI4, SD1, SD3, SD6, SD8, SD8, SD8, SD6, SD3, SD1, SI4, GI8, GI4, GI2],
    // Row 9 — sand beach
    [GI3, GI7, NI1, NI2, NI3, SD4, SD7, SD8, SD7, SD4, NI3, NI2, NI1, GI7, GI3, GI1],
    // Row 10 — wet sand, water encroaches
    [GI2, GI5, N, NI1, NI2, NI3, ND1, ND2, ND1, NI3, NI2, NI1, N, GI5, GI2, G],
    // Row 11 — shoreline
    [GI1, GI3, N, N, NI1, ND1, ND2, ND3, ND2, ND1, NI1, N, N, GI3, GI1, G],
    // Row 12 — shallow water
    [G, GI1, GI2, N, ND1, ND2, W, W, W, ND2, ND1, N, GI2, GI1, G, G],
    // Row 13 — open sea begins
    [G, G, GI1, GD1, ND1, W, W, W, W, W, ND1, GD1, GI1, G, G, G],
    // Row 14 — deep water
    [G, G, G, GD2, ND2, W, W, W, W, W, ND2, GD2, G, G, G, G],
    // Row 15 — open ocean
    [G, G, G, GD3, W, W, W, W, W, W, W, GD3, G, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
