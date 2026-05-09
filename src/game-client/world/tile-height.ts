import { TileHeight, Floor } from "kelvast-shared";
import { FLOOR } from "../constants";

/*
 * Maps every TileHeight value to a world-space Y offset within its floor band.
 * Inclines are positive fractions of FLOOR.HEIGHT (0 → 1 × HEIGHT).
 * Declines are negative fractions, descending below ground into dungeon space.
 * GROUND is always 0. Add on top of floorWorldY() to get absolute world Y.
 */
const TILE_HEIGHT_MAP: Record<TileHeight, number> = {
  [TileHeight.DECLINE_FULL]: FLOOR.HEIGHT * -1,
  [TileHeight.DECLINE_SEVEN_EIGHTHS]: FLOOR.HEIGHT * -0.875,
  [TileHeight.DECLINE_THREE_QUARTERS]: FLOOR.HEIGHT * -0.75,
  [TileHeight.DECLINE_FIVE_EIGHTHS]: FLOOR.HEIGHT * -0.625,
  [TileHeight.DECLINE_HALF]: FLOOR.HEIGHT * -0.5,
  [TileHeight.DECLINE_THREE_EIGHTHS]: FLOOR.HEIGHT * -0.375,
  [TileHeight.DECLINE_ONE_QUARTER]: FLOOR.HEIGHT * -0.25,
  [TileHeight.DECLINE_ONE_EIGHTH]: FLOOR.HEIGHT * -0.125,
  [TileHeight.GROUND]: 0,
  [TileHeight.INCLINE_ONE_EIGHTH]: FLOOR.HEIGHT * 0.125,
  [TileHeight.INCLINE_ONE_QUARTER]: FLOOR.HEIGHT * 0.25,
  [TileHeight.INCLINE_THREE_EIGHTHS]: FLOOR.HEIGHT * 0.375,
  [TileHeight.INCLINE_HALF]: FLOOR.HEIGHT * 0.5,
  [TileHeight.INCLINE_FIVE_EIGHTHS]: FLOOR.HEIGHT * 0.625,
  [TileHeight.INCLINE_THREE_QUARTERS]: FLOOR.HEIGHT * 0.75,
  [TileHeight.INCLINE_SEVEN_EIGHTHS]: FLOOR.HEIGHT * 0.875,
  [TileHeight.INCLINE_FULL]: FLOOR.HEIGHT * 1,
};

export function tileWorldY(tileHeight: TileHeight): number {
  return TILE_HEIGHT_MAP[tileHeight];
}

/*
 * Returns the world-space Y base for a given Floor value.
 * Positive floors stack upward, negative floors descend into dungeon space.
 * tileWorldY() is added on top of this to get the final absolute world Y.
 *
 * Example: INCLINE_HALF on FIRST floor = floorWorldY(Floor.FIRST) + tileWorldY(INCLINE_HALF)
 */
export function floorWorldY(floor: Floor): number {
  return floor * FLOOR.HEIGHT;
}
