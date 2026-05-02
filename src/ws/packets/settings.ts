import type { SaveSettingsPacket } from "../types";
import type { UserSettings } from "../../types/mmo/settings";
import { logger } from "../../utils/logger";
import { send } from "../client";

export function sendSettings(settings: UserSettings): void {
  logger.ws("→ save_settings", settings);
  const packet: SaveSettingsPacket = { type: "save_settings", settings };
  send(packet);
}
