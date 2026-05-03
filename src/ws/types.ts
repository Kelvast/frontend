import type { UserSettings } from "../types/mmo/settings";

export interface PingPacket {
  type: "ping";
  t: number;
}

export interface SaveSettingsPacket {
  type: "save_settings";
  settings: UserSettings;
}

/*
 * Client-side-only packet types not yet promoted to mmo-shared.
 * Used by send() alongside the shared ClientPacket union.
 * Promote to mmo-shared once ping and save_settings are added to the protocol.
 */
export type LocalClientPacket = PingPacket | SaveSettingsPacket;
