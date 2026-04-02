import { ChunkData, tileData, Tile, TileHeight } from "mmo-shared";

const Grass = tileData(Tile.Grass);
const Stone = tileData(Tile.Stone);

export default {
  pvp: false,
  tiles: [
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW)],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW)],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW)],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW)],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW)],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, tileData(Tile.Stone, TileHeight.SLOPE_LOW), tileData(Tile.Stone, TileHeight.SLOPE_LOW)],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, tileData(Tile.Stone, TileHeight.SLOPE_LOW)],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
