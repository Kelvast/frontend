import type { ActionStartMessage, ActionType } from "kelvast-shared";
import { MSG } from "kelvast-shared";
import { send } from "../client";

export function sendActionStart(action: ActionType, targetId: number): void {
  const packet: ActionStartMessage = { type: MSG.ACTION_START, action, targetId };
  send(packet);
}
