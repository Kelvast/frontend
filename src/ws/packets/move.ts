import type { MovePacket, ResolvedPace } from "mmo-shared";
import { send } from "../client";

export function sendPlayerMove(x: number, y: number, z: number, pace: ResolvedPace): void {
  const packet: MovePacket = { type: "move", x, y, z, pace };
  send(packet);
}
