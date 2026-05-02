import type { LogoutPacket } from "mmo-shared";
import { send } from "../client";

export function sendLogout(): void {
  const packet: LogoutPacket = { type: "logout" };
  send(packet);
}
