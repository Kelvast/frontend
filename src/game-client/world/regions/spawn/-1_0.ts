import { ChunkData, TILES } from "mmo-shared";

const { G, GD1, GD2, GD3, GD4, GD5, GD6, GD7, GD8, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ G  , G  , G  , G  , G  , G  , GI1, GI2, GI1, G  , G  , G  , G  , G  , G  , G   ],
    [ G  , G  , G  , G  , GI1, GI2, GI3, GI4, GI3, GI2, GI1, G  , G  , G  , G  , GI1 ],
    [ G  , G  , GI1, GI3, GI5, GI7, GI8, GI8, GI8, GI7, GI5, GI3, GI1, G  , G  , GI2 ],
    [ G  , GI2, GI5, GI8, GI1, GI3, GI5, GI7, GI5, GI3, GI1, GI8, GI5, GI2, G  , GI3 ],
    [ GI1, GI4, GI8, GI2, GI4, GI6, GI8, GI8, GI8, GI6, GI4, GI2, GI8, GI4, GI1, GI4 ],
    [ GI2, GI6, GI1, GI4, GI7, GI8, GI8, GI8, GI8, GI8, GI7, GI4, GI1, GI6, GI2, GI5 ],
    [ GI3, GI7, GI2, GI5, GI8, GI8, GD1, GD2, GD1, GI8, GI8, GI5, GI2, GI7, GI3, GI5 ],
    [ GI4, GI8, GI3, GI6, GD1, GD3, GD5, GD7, GD5, GD3, GD1, GI6, GI3, GI8, GI4, GI4 ],
    [ GI4, GI8, GI4, GD1, GD3, GD6, GD8, GD8, GD8, GD6, GD3, GD1, GI4, GI8, GI4, GI3 ],
    [ GI3, GI7, GI1, GI2, GI3, GD4, GD7, GD8, GD7, GD4, GI3, GI2, GI1, GI7, GI3, GI2 ],
    [ GI2, GI5, G  , GI1, GI2, GI3, GD1, GD2, GD1, GI3, GI2, GI1, G  , GI5, GI2, GI1 ],
    [ GI1, GI3, G  , G  , GI1, GD1, GD2, GD3, GD2, GD1, GI1, G  , G  , GI3, GI1, G   ],
    [ G  , GI1, GI2, G  , GD1, GD2, G  , G  , G  , GD2, GD1, G  , GI2, GI1, G  , G   ],
    [ G  , G  , GI1, GD1, GD1, G  , G  , G  , G  , G  , GD1, GD1, GI1, G  , G  , G   ],
    [ G  , G  , G  , GD2, GD2, G  , G  , G  , G  , G  , GD2, GD2, G  , G  , G  , G   ],
    [ G  , G  , G  , GD3, G  , G  , G  , G  , G  , G  , G  , GD3, G  , G  , G  , G   ],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
