import { ChunkData, TILES } from "mmo-shared";

const { G, GD1, GD2, GD3, GD4, GD5, GI1, GI2, GI3, GI4, GI5, GI6, GI8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ G  , G  , G  , G  , G  , G  , GI1, GI2, GI1, G  , G  , G  , G  , G  , G  , G ],
    [ G  , G  , GI2, GI3, GI2, GI3, GI3, GI4, GI3, GI3, GI2, GI3, GI2, G  , G  , G ],
    [ G  , GI2, GI4, GI5, GI3, GI5, GI4, GI3, GI4, GI5, GI4, GI5, GI4, GI2, G  , GI1 ],
    [ G  , GI3, GI5, GI4, GI3, GI4, GI2, GI1, GI2, GI4, GI5, GI4, GI4, GI2, G  , GI1 ],
    [ GI1, GI3, GI3, GI3, GI4, GI2, G  , GD1, G  , GI2, GI4, GI5, GI3, GI4, GI2, GI2 ],
    [ GI2, GI4, GI3, GI4, GI2, G  , GD2, GD3, GD1, GI1, GI3, GI4, GI4, GI5, GI3, GI2 ],
    [ GI3, GI5, GI4, GI2, G  , GD2, GD4, GD5, GD3, GD1, GI1, GI3, GI5, GI6, GI4, GI2 ],
    [ GI4, GI5, GI3, GI1, GD1, GD3, GD5, GD4, GD2, G  , GI2, GI4, GI5, GI5, GI3, GI1 ],
    [ GI4, GI4, GI2, G  , GD2, GD3, GD5, GD5, GD3, GD1, GI1, GI2, GI3, GI5, GI3, GI1 ],
    [ GI3, GI4, GI2, GI2, G  , GD1, GD3, GD3, GD1, GI1, GI3, GI2, GI2, GI4, GI3, GI1 ],
    [ GI2, GI2, G  , GI1, GI2, GI1, GD1, GD2, GD1, GI1, GI2, GI1, GI2, GI4, GI2, GI2 ],
    [ GI1, GI2, G  , G  , GI1, GD1, GD2, GD2, GD2, GD1, GI1, G  , GI1, GI3, GI1, GI2 ],
    [ G  , GI1, GI2, G  , GD1, GD2, G  , G  , G  , GD2, GD1, G  , GI2, GI1, GI2, GI1 ],
    [ G  , G  , GI1, GD1, GD1, G  , G  , G  , G  , G  , GD1, GD1, GI1, GI2, GI4, GI1 ],
    [ G  , G  , G  , GD2, GD2, G  , G  , G  , G  , G  , GD2, G  , GI2, GI4, GI6, G ],
    [ GD2, GD2, G  , G  , G  , G  , G  , G  , G  , G  , G  , GI2, GI2, GI2, GI8, G ],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
