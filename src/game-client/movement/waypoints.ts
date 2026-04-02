import { Vector3 } from "@babylonjs/core";
import { WORLD } from "mmo-shared";
import { PLAYER } from "../constants";

const s = WORLD.TILE_SIZE;

function tileCentre(worldCoord: number): number {
  return Math.floor(worldCoord / s) * s + s / 2;
}

export function buildWaypoints(from: Vector3, toX: number, toZ: number): Vector3[] {
  let x = tileCentre(from.x);
  let z = tileCentre(from.z);
  const endX = tileCentre(toX);
  const endZ = tileCentre(toZ);

  if (x === endX && z === endZ) return [];

  const waypoints: Vector3[] = [];

  while (x !== endX || z !== endZ) {
    if (x !== endX) x += x < endX ? s : -s;
    if (z !== endZ) z += z < endZ ? s : -s;
    waypoints.push(new Vector3(x, PLAYER.Y_OFFSET, z));
  }

  return waypoints;
}
