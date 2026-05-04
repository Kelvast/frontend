import { ChunkData, TILES } from "mmo-shared";

const { G, GD1, GD2, GD3, GD4, GD5, GD6, GD8, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    [ G  , G  , GI1, GI2, GI3, GI4, GI3, GI2, GI1, G  , G  , G  , G  , G  , G  , G   ],
    [ G  , GI1, GI2, GI3, GI4, GI5, GI5, GI4, GI2, GI1, G  , G  , G  , GD1, GD1, G   ],
    [ G  , GI2, GI4, GI6, GI7, GI8, GI8, GI6, GI4, GI2, G  , G  , GI2, GI4, GI2, G   ],
    [ G  , GI1, GI3, GI5, GI7, GI8, GI8, GI7, GI5, GI3, GI3, GI5, GI8, GI5, GI4, GD1 ],
    [ G  , G  , GI2, GI4, GI6, GI7, GI8, GI7, GI6, GI4, GI5, GI8, GI5, GI3, GI2, GD1 ],
    [ G  , G  , G  , GI1, GI3, GI5, GI6, GI5, GI3, GI1, G  , G  , GI3, G  , G  , GD2 ],
    [ G  , G  , G  , G  , GI1, GI2, GI3, GI2, GI1, G  , G  , G  , G  , G  , GD2, GD2 ],
    [ G  , G  , G  , G  , G  , GI1, GI1, G  , G  , G  , G  , G  , GD3, GD3, GD3, GD3 ],
    [ G  , G  , GD1, GD1, G  , G  , G  , G  , GD1, GD2, GD3, GD3, GD5, GD4, GD4, GD3 ],
    [ G  , GD1, GD2, GD3, GD2, GD1, G  , GD1, GD2, GD4, GD5, GD5, GD5, GD8, GD5, GD4 ],
    [ GD1, GD2, GD3, GD4, GD4, GD3, GD2, GD3, GD4, GD5, GD6, GD8, GD8, GD5, GD6, GD4 ],
    [ GD2, GD3, GD4, GD5, GD5, GD4, GD4, GD5, GD5, GD6, GD6, GD6, GD8, GD6, GD6, GD3 ],
    [ GD3, GD4, GD5, GD6, GD6, GD5, GD5, GD6, GD6, GD6, GD8, GD8, GD5, GD3, GD6, GD2 ],
    [ GD4, GD5, GD6, GD6, GD6, GD6, GD6, GD6, GD8, GD8, GD8, GD5, GD3, GD4, GD4, GD1 ],
    [ GD5, GD6, GD6, GD6, GD8, GD8, GD8, GD8, GD5, GD5, GD3, GD6, GD6, GD4, GD2, G   ],
    [ G  , G  , GI1, GI2, GI1, GI2, GI3, GI4, GI3, GI2, GI1, GI2, GI1, G  , G  , G   ],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
