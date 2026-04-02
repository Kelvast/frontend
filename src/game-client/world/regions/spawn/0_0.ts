import { ChunkData, tileData, Tile, TileHeight } from "mmo-shared";

const Grass = tileData(Tile.Grass);
const Stone = tileData(Tile.Stone);
const Road = tileData(Tile.Road);

export default {
  pvp: false,
  tiles: [
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Stone, Grass, Stone, Stone, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Stone, Stone, Stone, Stone, Stone, Stone, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Stone, Stone, Stone, Grass, Grass, Grass, Grass, Grass, Grass, Stone, Grass],
    [Road, Road, Road, Road, Road, Road, Road, Grass, Stone, Stone, Grass, Grass, Grass, Grass, Stone, Grass],
    [Grass, Grass, Grass, Grass, Grass, Stone, Road, Road, Road, Grass, Stone, Stone, Stone, Stone, Stone, Grass],
    [Grass, Grass, Grass, Grass, Stone, Grass, Stone, Grass, Road, Road, Road, Road, Road, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Stone, Grass, Stone, Grass, Grass, Stone, Stone, Road, Road, Road, Road],
    [Grass, Grass, Grass, Grass, Stone, Stone, Grass, Grass, Stone, Grass, Stone, Grass, Grass, Grass, Grass, Road],
    [Grass, Grass, Grass, Grass, Stone, Stone, Stone, Stone, Stone, Stone, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Stone, Stone, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
    [Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass, Grass],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
