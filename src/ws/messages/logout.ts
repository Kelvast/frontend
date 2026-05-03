import type { SessionClosePacket } from "mmo-shared";
import { MSG } from "mmo-shared";
import { send } from "../client";

export function sendLogout(): void {
  const packet: SessionClosePacket = { type: MSG.SESSION_CLOSED };
  send(packet);
}
