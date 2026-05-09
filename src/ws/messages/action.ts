import { MSG, type ActionMessage } from "kelvast-shared";
import { send } from "../client";

export function sendAction(action: "interact" | "attack", targetId: number): void {
  const packet: ActionMessage = { type: MSG.ACTION, action, targetId };
  send(packet);
}
