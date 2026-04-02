import { ChunkData, tileData, Tile, TileHeight } from "mmo-shared";

const Stone_SLOPE_HIGH = tileData(Tile.Stone, TileHeight.SLOPE_HIGH);
const Stone_SLOPE_MID = tileData(Tile.Stone, TileHeight.SLOPE_MID);
const Stone_SLOPE_LOW = tileData(Tile.Stone, TileHeight.SLOPE_LOW);
const Grass = tileData(Tile.Grass);

export default {
  pvp: false,
  tiles: [
    [Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH, Stone_SLOPE_HIGH],
    [Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID, Stone_SLOPE_MID],
    [Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW, Stone_SLOPE_LOW],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
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
