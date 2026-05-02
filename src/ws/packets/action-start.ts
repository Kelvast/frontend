import type { ActionStartPacket, ActionType } from "mmo-shared";
import { send } from "../client";

// future: Phase 3 - initiates a gather or combat action
export function sendActionStart(action: ActionType, targetId: number): void {
  const packet: ActionStartPacket = { type: "action_start", action, targetId };
  send(packet);
}
