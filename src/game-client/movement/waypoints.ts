import { Vector3 } from "@babylonjs/core";
import { buildWaypoints as sharedBuildWaypoints } from "mmo-shared";
import { PLAYER } from "../constants";

/**
 * Client adapter for the shared buildWaypoints utility.
 * Converts the plain {x, z} results to Babylon Vector3 with the player Y offset applied.
 */
export function buildWaypoints(from: Vector3, toX: number, toZ: number): Vector3[] {
  return sharedBuildWaypoints(from.x, from.z, toX, toZ).map(
    ({ x, z }) => new Vector3(x, PLAYER.Y_OFFSET, z),
  );
}
