import { ChunkData, TILES } from "mmo-shared";

const { G, GD1, GD2, GD3, GD4, GD5, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ G  , GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI6, GI5, GI4, GI3, GI2, GI1, G  , G   ],
    [ GI1, GI3, GI5, GI7, GI8, GI1, GI2, GI3, GI2, GI1, GI8, GI7, GI5, GI3, GI1, G   ],
    [ GI2, GI5, GI8, GI2, GI4, GI6, GI8, GI8, GI8, GI6, GI4, GI2, GI8, GI5, GI2, G   ],
    [ GI3, GI6, GI1, GI3, GI6, GI8, GI8, GI8, GI8, GI8, GI6, GI3, GI1, GI6, GI3, G   ],
    [ GI4, GI7, GI2, GI5, GI8, G  , GI1, GI2, GI1, G  , GI8, GI5, GI2, GI7, GI4, G   ],
    [ GI5, GI8, GI3, GI8, G  , GI2, GI3, GI4, GI3, GI2, G  , GI8, GI3, GI8, GI5, G   ],
    [ GI5, GI8, GI4, GI8, GI1, GI3, GI4, GI4, GI4, GI3, GI1, GI8, GI4, GI8, GI5, G   ],
    [ GI4, GI7, GI5, GI8, GI2, GI4, G  , G  , G  , GI4, GI2, GI8, GI5, GI7, GI4, G   ],
    [ GI3, GI6, GI4, GI8, GI1, GI3, GI4, GI4, GI4, GI3, GI1, GI8, GI4, GI6, GI3, G   ],
    [ GI2, GI5, GI3, GI6, GI8, GD1, GD2, GD3, GD2, GD1, GI8, GI6, GI3, GI5, GI2, G   ],
    [ GI1, GI3, GI6, GI2, GI5, GI8, GD1, GD2, GD1, GI8, GI5, GI2, GI6, GI3, GI1, G   ],
    [ G  , GI2, GI4, GI7, GI1, GI4, GI7, GD3, GI7, GI4, GI1, GI7, GI4, GI2, G  , G   ],
    [ G  , GI1, GI3, GI5, GI8, GI1, GI3, GD4, GI3, GI1, GI8, GI5, GI3, GI1, G  , G   ],
    [ G  , G  , GI2, GI4, GI6, GI8, GI7, GD5, GI7, GI8, GI6, GI4, GI2, G  , G  , G   ],
    [ G  , G  , GI1, GI2, GI4, GI5, GI4, GD1, GI4, GI5, GI4, GI2, GI1, G  , G  , G   ],
    [ G  , G  , GI1, GI2, GI3, GI4, GI3, GI2, GI1, G  , G  , G  , G  , G  , G  , G   ],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
