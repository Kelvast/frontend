import { TileHeight } from "mmo-shared";
import { FLOOR } from "../constants";

/**
 * Maps TileHeight fractional-floor values to world-space Y positions.
 * FLOOR constants define the pixel/unit height of one full floor.
 */
const TILE_HEIGHT_MAP: Record<TileHeight, number> = {
  [TileHeight.GROUND]:      0,
  [TileHeight.SLOPE_LOW]:   FLOOR.HEIGHT * 0.25,
  [TileHeight.SLOPE_MID]:   FLOOR.HEIGHT * 0.5,
  [TileHeight.SLOPE_HIGH]:  FLOOR.HEIGHT * 0.75,
  [TileHeight.FIRST_FLOOR]: FLOOR.FIRST_FLOOR,
  [TileHeight.SECOND_FLOOR]:FLOOR.SECOND_FLOOR,
  [TileHeight.THIRD_FLOOR]: FLOOR.THIRD_FLOOR,
};

export function tileWorldY(tileHeight: TileHeight): number {
  return TILE_HEIGHT_MAP[tileHeight];
}
