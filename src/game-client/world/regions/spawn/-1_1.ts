import { ChunkData, tileData, Tile, TileHeight } from "mmo-shared";

const Sand = tileData(Tile.Sand);
const Grass = tileData(Tile.Grass);
const Water = tileData(Tile.Water);

export default {
  pvp: false,
  tiles: [
    [Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Sand, Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Water, Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Water, Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Water, Water, Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Water, Water, Sand, Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Water, Water, Water, Sand, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Sand],
    [Water, Water, Water, Sand, Sand, Grass, Grass, Grass, Sand, Sand, Sand, Sand, Sand, Sand, Sand, Sand],
    [Water, Water, Water, Water, Sand, Sand, Sand, Sand, Sand, Water, Water, Water, Water, Water, Water, Water],
    [Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water],
    [Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water],
    [Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water],
    [Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water],
    [Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water],
    [Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water, Water],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
