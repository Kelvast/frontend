import { ChunkData, TILES } from "mmo-shared";

const { D, DD1, DI1, DI2, DI3, G, GD1, GD2, GI1, GI2, GI5, R, RD1, RD2, RI1, RI2, RI3, RI5 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ G  , G  , G  , G  , G  , D  , R  , R  , R  , D  , G  , G  , G  , G  , G  , GI1 ],
    [ G  , G  , G  , G  , DI1, DI2, RI1, RI2, RI1, DI2, DI1, G  , G  , G  , G  , GI1 ],
    [ G  , G  , G  , DI1, DI3, RI1, RI2, RI3, RI2, RI1, DI3, DI1, G  , G  , G  , GD1 ],
    [ G  , G  , GI1, GI2, RI1, RI2, RI2, RI2, RI2, RI2, RI1, GI2, GI1, G  , G  , GD1 ],
    [ G  , GI1, GI2, R  , R  , R  , R  , R  , R  , R  , R  , R  , GI2, GI1, G  , GI1 ],
    [ G  , D  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , D  , GI2, GI5 ],
    [ R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , RI2, RI5 ],
    [ G  , D  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , R  , D  , G  , G ],
    [ G  , GD1, RD1, RD1, RD1, R  , R  , R  , R  , R  , RD1, RD1, RD1, GD1, G  , G ],
    [ G  , GD2, RD2, RD2, D  , D  , R  , R  , R  , D  , DD1, RD2, RD2, GD2, G  , G ],
    [ G  , GD2, DD1, D  , D  , D  , D  , R  , D  , D  , D  , D  , DD1, GD2, G  , G ],
    [ G  , GD1, D  , D  , D  , D  , D  , D  , D  , D  , D  , D  , D  , GD1, G  , G ],
    [ G  , G  , D  , D  , D  , D  , D  , D  , D  , D  , D  , D  , D  , G  , G  , G ],
    [ G  , G  , G  , D  , D  , D  , D  , D  , D  , D  , D  , D  , G  , G  , G  , G ],
    [ G  , G  , G  , G  , GD1, D  , D  , D  , D  , D  , GD1, G  , G  , G  , G  , G ],
    [ G  , G  , G  , G  , G  , G  , D  , D  , D  , G  , G  , G  , G  , G  , G  , G ],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
