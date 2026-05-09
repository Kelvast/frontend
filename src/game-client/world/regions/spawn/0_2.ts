import { ChunkData, TILES } from "kelvast-shared";

const { G, GD1, GI1, GI2, GI4, GI6, S, SD1, SD2, SI1, SI2, SI3, SI4, SI5, SI6, SI7, SI8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [G, G, SI4, G, G, G, G, G, G, G, G, G, G, G, G, GI1],
    [G, GI2, SI2, G, G, G, G, G, G, G, G, G, G, G, G, GI1],
    [G, GI2, SI2, G, GI2, SI2, S, SD2, SD2, SD2, SD2, SD2, SD2, SD2, SD2, GD1],
    [SI8, SI4, SI2, GI2, SI3, SI2, S, SD2, G, SD2, SD2, SD2, G, G, SD2, GD1],
    [SI8, SI6, SI4, SI4, SI2, SI2, G, SD2, SD2, G, SD2, G, G, G, SD1, GI1],
    [SI1, SI4, SI4, GI6, SI4, SI2, G, G, SD2, SD2, SD2, SD2, SD2, G, SI1, SI5],
    [SI1, SI4, SI4, SI5, SI3, SI2, SI1, G, S, G, G, SD2, G, G, SI2, SI5],
    [SI7, SI6, SI6, SI4, SI3, SI4, SI2, S, SI2, S, G, G, SD2, SD2, G, S],
    [SI8, SI8, SI6, SI6, SI4, SI2, SI1, SI2, S, SI2, G, SD2, G, SD2, SD2, S],
    [SI8, SI8, SI6, SI4, SI4, GI2, SI2, SI2, SI2, SI2, G, G, SD2, SD2, G, S],
    [SI8, SI8, SI6, SI4, SI6, SI4, SI4, SI2, SI2, S, SD2, G, SD2, SD2, SD2, S],
    [SI8, SI8, SI6, SI4, SI6, SI4, SI2, GI2, SI1, G, SD2, G, SD2, SD2, G, S],
    [SI8, SI6, SI4, GI4, SI4, SI2, GI2, SI3, SI2, GI2, S, G, SD2, SD2, SD2, S],
    [SI8, SI6, SI4, GI4, SI2, GI2, SI4, SI2, SI4, SI2, S, G, SD2, SD2, SD2, S],
    [G, SI6, SI2, SI2, G, GI2, SI2, GI2, SI2, S, SD2, G, G, G, G, G],
    [SI8, SI8, G, G, G, G, G, G, G, G, SD2, SD2, G, G, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
