import { ChunkData, TILES } from "mmo-shared";

const { G, D, S, W, N, GI1, GI2, GI3, GD1, GD2, GD3, GD4, GD5, GD6, DD1, DD2, DD3, DD4, NI1, NI2, ND1, ND2, ND3, SI1, SI2, SD1, SD2, SD3, SD4, SD5 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    // Row 0 — transition from chunk above
    [G, G, GD1, GD1, G, G, G, G, G, G, G, G, GD1, G, G, G],
    // Row 1 — soggy ground begins
    [G, GD1, GD2, GD1, G, G, D, D, D, G, G, GD1, GD2, GD1, G, G],
    // Row 2 — muddy hollows
    [G, GD2, GD3, GD2, GD1, D, DD1, DD2, DD1, D, GD1, GD2, GD3, GD2, G, G],
    // Row 3 — shallow pools form
    [GD1, GD2, GD3, GD3, DD1, DD2, DD3, W, DD3, DD2, DD1, GD3, GD3, GD2, GD1, G],
    // Row 4 — swamp pools
    [GD1, GD3, GD4, DD1, DD2, W, W, W, W, W, DD2, DD1, GD4, GD3, GD1, G],
    // Row 5 — deep swamp
    [GD2, GD4, DD1, DD2, W, W, W, W, W, W, W, DD2, DD1, GD4, GD2, G],
    // Row 6 — swamp islands, sandy patches
    [GD2, GD3, DD2, W, W, N, NI1, NI2, NI1, N, W, W, DD2, GD3, GD2, G],
    // Row 7 — deeper water, stone outcrops
    [GD3, DD1, DD3, W, W, W, SI1, SI2, SI1, W, W, W, DD3, DD1, GD3, G],
    // Row 8 — stone ridge through swamp
    [GD3, DD2, W, W, SD1, SD2, SD3, SD4, SD3, SD2, SD1, W, W, DD2, GD3, G],
    // Row 9 — swamp narrows south
    [GD4, DD2, DD1, W, W, W, SD2, SD5, SD2, W, W, W, DD1, DD2, GD4, G],
    // Row 10 — south swamp edge
    [GD4, GD5, DD2, DD1, W, W, W, W, W, W, W, DD1, DD2, GD5, GD4, G],
    // Row 11 — bank rises again
    [GD3, GD4, GD5, DD2, DD1, ND1, ND2, ND3, ND2, ND1, DD1, DD2, GD5, GD4, GD3, G],
    // Row 12 — sandy southern shore
    [GD2, GD3, GD4, GD5, DD1, ND1, N, N, N, ND1, DD1, GD5, GD4, GD3, GD2, G],
    // Row 13 — south dry ground returns
    [GD1, GD2, GD3, GD4, GD5, GD4, GD3, GD2, GD3, GD4, GD5, GD4, GD3, GD2, GD1, G],
    // Row 14 — flattening out
    [G, GD1, GD2, GD3, GD4, GD3, GD2, GD1, GD2, GD3, GD4, GD3, GD2, GD1, G, G],
    // Row 15 — flat southern border
    [G, G, GD1, GD2, GD3, GD2, GD1, G, GD1, GD2, GD3, GD2, GD1, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
