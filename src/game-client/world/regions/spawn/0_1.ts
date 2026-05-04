import { ChunkData, TILES } from "mmo-shared";

const { D, DD1, DD2, DI1, DI2, DI3, G, GI1, GI2, GI3, GI4, GI5, S, SD1, SD2, SD3, SD4, SD5, SD6, SI1, SI2, SI3, SI4, SI5 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ G  , G  , GI1, GI2, GI3, GI2, GI1, G  , G  , GI1, GI2, GI3, GI2, GI1, G  , G ],
    [ G  , GI1, GI3, GI3, SI3, GI4, GI3, GI1, GI1, GI3, SI4, GI5, GI3, GI1, G  , G ],
    [ GI1, GI3, GI3, SI2, SI4, SI4, GI2, GI1, GI1, GI2, SI4, SI4, SI2, GI3, GI1, GI1 ],
    [ GI2, GI4, SI2, SI4, SI4, SI2, S  , SD1, SD1, S  , SI2, SI4, SI3, SI1, GI2, GI1 ],
    [ GI3, GI5, SI4, SI4, SI2, S  , SD2, SD3, SD3, SD2, S  , SI2, SI4, SI3, GI3, GI2 ],
    [ GI4, GI5, SI4, SI2, S  , SD2, SD4, SD5, SD5, SD3, SD1, SI1, SI3, SI4, GI4, GI2 ],
    [ GI4, GI4, SI2, S  , SD2, SD4, SD6, SD4, SD4, SD5, SD3, SD1, SI1, SI3, GI4, GI2 ],
    [ GI3, GI2, S  , SD2, SD4, SD6, SD4, SD2, SD2, SD4, SD4, SD2, S  , SI2, GI3, GI1 ],
    [ GI2, GI1, SD1, SD3, SD4, SD4, SD2, D  , DD1, SD3, SD5, SD3, SD1, SI1, GI2, GI1 ],
    [ GI1, G  , SD2, SD1, SD2, SD4, DD2, DD1, DD1, DD2, SD4, SD2, SD1, SI1, GI1, GI1 ],
    [ G  , G  , SD1, SD2, S  , SD2, D  , DI1, D  , D  , SD2, S  , SI1, SI1, GI2, GI2 ],
    [ G  , GI1, G  , S  , SD1, S  , SI2, DI3, DI2, SI2, S  , SI2, SI3, GI3, GI1, GI2 ],
    [ G  , G  , GI2, GI1, SI1, SI2, SI4, SI5, SI4, SI4, SI2, SI4, GI4, GI2, G  , GI2 ],
    [ G  , G  , GI1, GI3, GI3, SI4, SI4, SI4, SI4, SI4, SI4, GI4, GI3, GI1, G  , GI1 ],
    [ G  , G  , GI2, GI2, GI2, GI2, GI2, GI2, GI2, GI2, GI2, GI2, GI2, G  , G  , G ],
    [ G  , G  , GI4, G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , GI1 ],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
