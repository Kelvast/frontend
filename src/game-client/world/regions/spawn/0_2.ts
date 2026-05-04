import { ChunkData, TILES } from "mmo-shared";

const { G, D, S, N, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8, GD1, GD2, GD3, NI1, NI2, NI3, NI4, NI5, NI6, NI7, NI8, ND1, ND2, ND3, ND4, SI2, SI4, SI6, SI8, SD2, SD4, SD6, DI2, DI4, DD2, DD4 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    // Row 0 — northern approach, grass fades to sand
    [G, G, GI1, GI2, NI1, NI2, NI3, NI4, NI3, NI2, NI1, GI2, GI1, G, G, G],
    // Row 1 — plateau base
    [G, GI1, NI1, NI3, NI5, NI6, NI7, NI8, NI7, NI6, NI5, NI3, NI1, GI1, G, G],
    // Row 2 — plateau face
    [GI1, NI2, NI4, NI6, NI8, NI8, NI8, NI8, NI8, NI8, NI6, NI4, NI2, GI1, G, G],
    // Row 3 — plateau surface, flat sand
    [NI1, NI3, NI5, N, N, N, N, N, N, N, N, NI5, NI3, NI1, G, G],
    // Row 4 — plateau top with stone ruins
    [N, N, N, N, S, SI2, SI4, SI6, SI4, SI2, S, N, N, N, N, G],
    // Row 5 — ruin walls
    [N, N, N, SI2, SI8, N, N, N, N, N, SI8, SI2, N, N, N, N],
    // Row 6 — ruin interior
    [N, N, N, SI4, N, N, D, DI2, DI4, N, N, SI4, N, N, N, N],
    // Row 7 — ruin interior deep, dirt floor
    [N, N, N, SI4, N, DI2, DI4, DD2, DI4, DI2, N, SI4, N, N, N, N],
    // Row 8 — ruin south wall
    [N, N, N, SI2, SI8, N, N, N, N, N, SI8, SI2, N, N, N, N],
    // Row 9 — plateau south edge
    [N, N, N, N, S, SD2, SD4, SD6, SD4, SD2, S, N, N, N, N, N],
    // Row 10 — descent south face
    [NI3, NI5, ND1, ND2, ND3, ND4, ND4, ND4, ND4, ND3, ND2, ND1, NI5, NI3, N, N],
    // Row 11 — bottom of plateau
    [GI2, NI2, NI4, ND1, ND2, ND3, ND3, ND3, ND3, ND2, ND1, NI4, NI2, GI2, G, G],
    // Row 12 — transition back to grass
    [G, GI1, NI1, NI2, ND1, ND2, ND2, ND2, ND2, ND1, NI2, NI1, GI1, G, G, G],
    // Row 13 — sparse desert edge
    [G, G, GI1, NI1, NI2, ND1, ND1, ND1, ND1, NI2, NI1, GI1, G, G, G, G],
    // Row 14 — grass returns
    [G, G, G, GI1, NI1, NI1, G, G, G, NI1, NI1, GI1, G, G, G, G],
    // Row 15 — flat southern border
    [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
