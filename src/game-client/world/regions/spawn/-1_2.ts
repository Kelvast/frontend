import { ChunkData, TILES } from "kelvast-shared";

const { G, GD1, GD2, GD3, GI1, GI3, GI5, GI8, S, SD1, SD2, SD3, SD4, SD5, SI1, SI2, SI3, SI4, SI5, SI6, SI7, SI8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [SD2, SD5, SD5, SD5, SD5, SD2, SD2, SD2, SD2, SD2, SD2, SD2, G, SD5, G, G],
    [G, SD3, GD3, SD2, SD2, S, S, SD1, SD3, SD4, SD3, SD3, GD1, SD2, GD2, G],
    [G, SD2, GD1, G, G, SI2, SI1, SD1, SD1, SD3, SD4, SD2, G, S, SD2, G],
    [G, SD2, GD3, GD1, G, S, S, GI1, SD1, SD3, SD3, SD2, S, G, S, SI8],
    [G, SD2, SD3, GD3, SD2, SD1, SI1, SI1, SD1, SD3, SD1, S, SI2, SI2, SI2, SI8],
    [G, GD2, SD4, SD3, GD3, GD3, GD1, GD1, GD3, SD1, GI1, GI1, SI2, SI4, GI3, SI1],
    [G, SD2, SD2, SD2, SD4, SD3, GD3, GD1, GD1, SI1, GI3, GI3, SI4, SI4, SI3, SI1],
    [G, SD2, GD3, GD2, SD2, SD2, SD2, G, G, SI1, SI3, GI5, SI5, SI5, SI5, SI7],
    [G, GD2, SD3, GD3, GD3, GD3, GD2, G, GI1, SI3, SI4, SI6, SI5, SI4, SI6, SI8],
    [SD2, SD2, SD2, SD2, SD3, SD2, GD1, G, SI1, SI3, SI3, SI4, SI5, SI4, SI6, SI8],
    [SD5, GD2, G, GD1, SD1, GD1, GD1, SD1, S, GI1, SI1, SI3, SI3, SI4, SI6, SI8],
    [SI3, GD1, GD1, GI1, SI1, SD1, SD1, SD1, SD2, SD1, SD1, SI1, SI1, SI2, SI4, SI8],
    [SD5, SD3, SD1, SD1, S, SD1, SI1, SD1, SD2, SD3, SD3, SD1, SD1, S, SI2, SI8],
    [G, SD2, SD3, GD3, SD2, GD1, SD1, SD3, SD4, SD5, SD4, SD3, GD3, SD2, S, SI8],
    [G, SD2, SD2, SD2, GD2, SD1, SD1, SD2, SD4, SD4, SD2, SD2, SD2, SD2, SD2, S],
    [G, G, G, G, G, G, G, G, SD4, SD4, G, G, G, G, G, GI8],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
