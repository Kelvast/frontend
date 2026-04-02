import { ChunkData, tileData, TileHeight } from "mmo-shared";

const Grass = tileData("grass");
const Grass_SLOPE_LOW_MID = tileData("grass", TileHeight.SLOPE_LOW_MID);
const Grass_SLOPE_LOW = tileData("grass", TileHeight.SLOPE_LOW);
const Grass_SLOPE_HIGH = tileData("grass", TileHeight.SLOPE_HIGH);
const Grass_SLOPE_MID = tileData("grass", TileHeight.SLOPE_MID);
const Grass_SLOPE_MID_HIGH = tileData("grass", TileHeight.SLOPE_MID_HIGH);

export default {
  pvp: false,
  tiles: [
    [Grass, Grass, Grass, Grass, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_LOW_MID, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass_SLOPE_LOW, Grass_SLOPE_LOW, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_LOW_MID, Grass, Grass_SLOPE_HIGH, Grass],
    [Grass, Grass, Grass, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_HIGH, Grass_SLOPE_HIGH],
    [Grass, Grass, Grass, Grass, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass, Grass, Grass_SLOPE_LOW_MID, Grass, Grass_SLOPE_HIGH],
    [Grass, Grass_SLOPE_LOW_MID, Grass, Grass, Grass_SLOPE_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_MID, Grass_SLOPE_LOW_MID, Grass, Grass, Grass, Grass, Grass_SLOPE_LOW_MID, Grass, Grass_SLOPE_HIGH],
    [Grass, Grass, Grass, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass, Grass, Grass_SLOPE_LOW_MID, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_HIGH],
    [Grass, Grass, Grass, Grass, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_LOW, Grass_SLOPE_LOW, Grass_SLOPE_MID_HIGH, Grass, Grass, Grass, Grass_SLOPE_HIGH],
    [Grass_SLOPE_MID, Grass, Grass, Grass, Grass, Grass_SLOPE_MID, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass, Grass, Grass, Grass_SLOPE_HIGH],
    [Grass_SLOPE_LOW_MID, Grass_SLOPE_MID, Grass, Grass, Grass, Grass, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass_SLOPE_MID_HIGH, Grass, Grass_SLOPE_MID_HIGH, Grass, Grass, Grass, Grass, Grass_SLOPE_HIGH],
    [Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass_SLOPE_MID, Grass, Grass_SLOPE_MID, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_HIGH],
    [Grass, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass, Grass, Grass_SLOPE_MID, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_HIGH],
    [Grass, Grass, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_HIGH],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass_SLOPE_LOW_MID, Grass, Grass, Grass_SLOPE_HIGH, Grass_SLOPE_HIGH],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
