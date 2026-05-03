import { MSG, type PlayerDataMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * PLAYER_DATA (200) — second message of the handshake.
 * Carries skills, inventory, equipment. Once received the client is fully
 * hydrated and the loader should dismiss.
 */
let _onLoadEvent: OnLoadEvent | null = null;

export function setLoadEventCallback(cb: OnLoadEvent): void {
  _onLoadEvent = cb;
}

function handlePlayerData(_msg: PlayerDataMessage): void {
  logger.ws("Player data received");
  // future: useGameStore.getState().onPlayerData(_msg)
  _onLoadEvent?.({ stage: "connected" });
  _onLoadEvent = null;
}

registerMessageHandler<PlayerDataMessage>(MSG.PLAYER_DATA, handlePlayerData);
