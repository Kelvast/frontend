import { Vector3 } from "@babylonjs/core";
import type { Coords } from "mmo-shared";
import { WORLD } from "mmo-shared";
import { PLAYER } from "../constants";

const s = WORLD.TILE_SIZE;

function tileCentre(tileCoord: number): number {
  return tileCoord * s + s / 2;
}

/*
 * Converts server-authoritative path (tile coords) into world-space Vector3
 * waypoints for Babylon.js interpolation. The starting tile is excluded — the
 * player mesh is already there.
 */
export function pathToWaypoints(path: Coords[]): Vector3[] {
  return path.map(({ x, z }) => new Vector3(tileCentre(x), PLAYER.Y_OFFSET, tileCentre(z)));
}
