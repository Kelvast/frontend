import type { PingPacket } from "../types";
import { send } from "../client";

export function sendPing(): void {
  const packet: PingPacket = { type: "ping", t: Date.now() };
  send(packet);
}
