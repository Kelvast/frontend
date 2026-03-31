import { ChunkData, tile, TileType, TileHeight } from "../../../../types";

const W = tile(TileType.WATER);
const G = tile(TileType.GRASS);

export default {
  pvp: false,
  tiles: [
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    [W, W, W, W, W, G, G, G, G, G, W, W, W, W, W, W],
    [W, W, W, W, G, G, G, G, G, G, G, G, G, W, W, W],
    [W, W, W, W, G, G, G, G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, G, G, G, W, W, W],
    [W, W, W, G, G, G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, G, G, G, W, W],
    [W, W, W, G, G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, G, G, W, W],
    [W, W, G, G, G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, G, G, W, W],
    [W, W, G, G, G, G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, G, G, W, W],
    [W, W, W, W, G, G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, G, G, W, W],
    [W, W, W, W, G, G, tile(TileType.GRASS, TileHeight.SLOPE_LOW), tile(TileType.GRASS, TileHeight.SLOPE_LOW), G, G, G, G, G, G, W, W],
    [W, W, W, W, G, G, G, G, G, G, G, G, G, W, W, W],
    [W, W, W, W, W, W, G, W, W, W, W, G, W, W, W, W],
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
    [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
