import type { UserSettings } from "../types/mmo/settings";

export interface PingPacket {
  type: "ping";
  t: number;
}

export interface SaveSettingsPacket {
  type: "save_settings";
  settings: UserSettings;
}

export interface PongMessage {
  type: "pong";
  t: number;
}

/*
 * Union of client-side-only packet types not yet promoted to mmo-shared.
 * Used by send() alongside the shared ClientPacket union.
 */
export type LocalClientPacket = PingPacket | SaveSettingsPacket;
