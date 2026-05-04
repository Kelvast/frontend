import { TileHeight } from "mmo-shared";
import { FLOOR } from "../constants";

/*
 * Maps every TileHeight slope value to a world-space Y position.
 * Only slope values (GROUND through SLOPE_HIGH) exist in TileHeight.
 * Floor-level world Y is derived from Coords.floor via floorWorldY().
 */
const TILE_HEIGHT_MAP: Record<TileHeight, number> = {
  [TileHeight.GROUND]: 0,
  [TileHeight.SLOPE_LOW]: FLOOR.HEIGHT * 0.25,
  [TileHeight.SLOPE_LOW_MID]: FLOOR.HEIGHT * 0.375,
  [TileHeight.SLOPE_MID]: FLOOR.HEIGHT * 0.5,
  [TileHeight.SLOPE_MID_HIGH]: FLOOR.HEIGHT * 0.625,
  [TileHeight.SLOPE_HIGH]: FLOOR.HEIGHT * 0.75,
};

export function tileWorldY(tileHeight: TileHeight): number {
  return TILE_HEIGHT_MAP[tileHeight];
}

/*
 * Returns the world-space Y base for a given floor index.
 * Slope offset (tileWorldY) is added on top of this for ground-floor tiles.
 */
export function floorWorldY(floor: number): number {
  return floor * FLOOR.HEIGHT;
}
