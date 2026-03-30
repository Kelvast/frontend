import { TileHeight } from "../../types/mmo/world";
import { FLOOR } from "../constants";

const TILE_HEIGHT_MAP: Record<TileHeight, number> = {
  [TileHeight.GROUND]: 0,
  [TileHeight.SLOPE_LOW]: FLOOR.HEIGHT * 0.25,
  [TileHeight.SLOPE_MID]: FLOOR.HEIGHT * 0.5,
  [TileHeight.SLOPE_HIGH]: FLOOR.HEIGHT * 0.75,
  [TileHeight.FIRST_FLOOR]: FLOOR.FIRST_FLOOR,
  [TileHeight.SECOND_FLOOR]: FLOOR.SECOND_FLOOR,
  [TileHeight.THIRD_FLOOR]: FLOOR.THIRD_FLOOR,
};

export function tileWorldY(tileHeight: TileHeight): number {
  return TILE_HEIGHT_MAP[tileHeight];
}
