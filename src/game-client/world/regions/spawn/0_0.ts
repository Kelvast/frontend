import { ChunkData, TILES } from "kelvast-shared";

const { D, DD1, DD2, DI1, DI2, DI3, G, GI1, GI2, GI3, GI4, O, OD1, OD2, OD3, OI1, OI2, OI3, OI4, OI5 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [G, G, GI1, GI2, GI1, G, G, OI1, OI1, G, G, GI1, GI2, GI1, G, G],
    [G, GI1, GI2, GI3, GI2, GI2, OI2, OI3, OI3, OI2, GI2, GI2, GI3, GI2, GI1, G],
    [GI1, GI2, GI3, OI1, OI3, OI4, OI2, OI2, OI2, OI2, OI4, OI3, OI2, GI3, GI2, G],
    [GI1, GI3, OI1, OI3, OI2, OI2, O, O, O, OI2, OI2, OI2, OI3, OI1, GI2, G],
    [GI2, GI4, OI2, OI2, O, O, O, O, O, O, O, OI2, OI2, OI2, GI2, G],
    [GI2, GI4, OI2, O, O, O, OD1, OD2, OD2, OD1, O, O, O, OI2, GI2, G],
    [GI2, GI3, OI2, O, OD1, OD2, OD3, DD1, DD1, OD3, OD2, OD1, O, OI2, GI2, G],
    [GI1, GI2, GI1, OD1, OD3, DD1, DD2, DD2, DD2, DD2, DD1, OD2, O, GI2, GI2, G],
    [GI1, GI2, GI2, O, DD1, DD2, DD2, D, DD1, DD2, DD2, DD1, OI1, GI3, GI2, G],
    [GI1, GI2, GI1, OD1, OD1, D, D, DI1, DI1, D, D, O, OI2, GI3, GI2, G],
    [GI2, GI3, OI1, O, OI1, OI2, DI2, DI3, DI2, D, OI2, OI1, O, OI1, GI2, G],
    [GI2, GI4, OI2, OI1, OI3, OI4, OI2, OI2, OI2, OI2, OI4, OI3, OI1, OI2, GI2, G],
    [GI1, GI3, OI2, OI3, OI4, OI2, OI2, OI3, OI3, OI3, OI4, OI5, OI3, OI2, GI2, G],
    [GI1, GI2, GI3, OI1, OI3, OI2, OI3, OI4, OI4, OI3, OI2, OI3, OI2, GI4, GI2, G],
    [G, GI1, GI2, GI3, GI2, GI1, OI1, OI2, OI2, OI1, GI1, GI2, GI3, GI2, GI1, G],
    [G, G, GI1, GI2, GI3, GI2, GI1, O, O, GI1, GI2, GI3, GI2, GI1, G, G],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
