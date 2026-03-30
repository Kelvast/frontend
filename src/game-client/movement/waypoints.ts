import { Vector3 } from "@babylonjs/core";
import { PLAYER } from "../constants";

export function buildWaypoints(from: Vector3, toX: number, toZ: number): Vector3[] {
  let cx = Math.round(from.x);
  let cz = Math.round(from.z);
  const endX = Math.round(toX);
  const endZ = Math.round(toZ);
  const waypoints: Vector3[] = [];

  while (cx !== endX || cz !== endZ) {
    const dx = endX - cx;
    const dz = endZ - cz;
    if (Math.abs(dx) >= Math.abs(dz)) {
      cx += Math.sign(dx);
    } else {
      cz += Math.sign(dz);
    }
    waypoints.push(new Vector3(cx, PLAYER.Y_OFFSET, cz));
  }

  return waypoints;
}
