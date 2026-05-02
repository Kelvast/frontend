import type { ActionPacket } from "mmo-shared";
import { send } from "../client";

export function sendAction(action: "interact" | "attack", targetId: number): void {
  const packet: ActionPacket = { type: "action", action, targetId };
  send(packet);
}
