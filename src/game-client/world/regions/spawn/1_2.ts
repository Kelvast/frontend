import { ChunkData, TILES } from "mmo-shared";

const { G, GI1, GI2, GI5, R, RD1, RI1, RI2, SI1, SI3 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ RI1, RD1, RD1, G  , SI1, SI1, SI1, SI1, SI1, SI1, G  , G  , G  , G  , G  , G ],
    [ RI1, RI1, RD1, RD1, SI1, SI1, SI1, G  , G  , G  , G  , G  , G  , G  , G  , G ],
    [ RD1, RI1, RI1, RD1, RD1, RD1, SI1, G  , G  , G  , G  , G  , G  , G  , G  , G ],
    [ RD1, RD1, RI1, RI1, RD1, RD1, RD1, G  , G  , G  , G  , G  , G  , G  , G  , G ],
    [ SI1, RD1, RI1, RI1, RI1, RD1, RD1, G  , SI1, G  , SI1, SI1, G  , G  , G  , G ],
    [ GI5, RI1, R  , RI1, RI1, RI1, RD1, RD1, SI1, G  , SI1, SI1, SI1, SI1, G  , G ],
    [ GI5, SI3, RI2, R  , RI1, RI1, RI1, RD1, RD1, G  , G  , SI1, G  , G  , SI1, G ],
    [ G  , GI2, GI1, RD1, RD1, RI1, RI1, RI1, RD1, RD1, G  , SI1, G  , SI1, SI1, G ],
    [ G  , G  , GI1, GI1, RD1, RD1, RI1, RI1, RI1, RD1, RD1, G  , SI1, SI1, G  , G ],
    [ G  , G  , G  , GI1, G  , RD1, RD1, RI1, RI1, RI1, RD1, RD1, SI1, G  , G  , G ],
    [ G  , G  , G  , SI1, SI1, SI1, RD1, RD1, RI1, RI1, RI1, RD1, RD1, SI1, G  , G ],
    [ G  , SI1, SI1, SI1, G  , G  , G  , RD1, RD1, RI1, RI1, RI1, RD1, RD1, G  , G ],
    [ G  , G  , G  , SI1, SI1, SI1, SI1, G  , RD1, RD1, RI1, RI1, RI1, RD1, RD1, G ],
    [ G  , G  , G  , G  , G  , G  , G  , SI1, SI1, RD1, RD1, RI1, RI1, RI1, RD1, RD1 ],
    [ G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , RD1, RD1, RI1, RI1, RD1 ],
    [ G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , G  , RD1, G  , RI1, G ],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
