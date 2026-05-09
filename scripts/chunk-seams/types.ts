import { TileData, TileHeight } from "kelvast-shared";

/*
 * Script-local type aliases. All tile types and world constants come from
 * mmo-shared — nothing is redefined here.
 */
export type ChunkCoord = [number, number];
export type TileGrid = TileData[][];

export interface Mismatch {
  chunkA: ChunkCoord;
  chunkB: ChunkCoord;
  edge: "east-west" | "south-north";
  index: number;
  heightA: TileHeight;
  heightB: TileHeight;
}

/*
 * Maximum TileHeight step permitted between adjacent interior tiles during
 * easing. Raise for steeper slopes, lower for more gradual terrain.
 */
export const MAX_SLOPE_STEP = 2;

/*
 * Human-readable label for each TileHeight numeric value — used in mismatch
 * reports. Built from the enum itself so it stays in sync automatically.
 */
export const HEIGHT_NAME = Object.fromEntries(
  Object.entries(TileHeight)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => [v as number, k]),
) as Record<number, string>;
