import { MSG, type ActionPacket } from "mmo-shared";
import { send } from "../client";

export function sendAction(action: "interact" | "attack", targetId: number): void {
  const packet: ActionPacket = { type: MSG.ACTION, action, targetId };
  send(packet);
}
