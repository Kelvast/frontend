import type { PlayerStoppedMessage } from "mmo-shared";
import { MSG } from "mmo-shared";
import { registerMessageHandler } from "../registry";
import { useGameStore } from "../../utils/game-store";
import { getContext, hasContext } from "../../game-client/context";

/*
 * PLAYER_STOPPED — server has halted movement (rejected move or path end).
 *
 * For the local player: snap the mesh to the server position and update
 * the store so all systems see the corrected coords.
 * For remote players: the store handles the update, no mesh work needed here.
 */
registerMessageHandler<PlayerStoppedMessage>(MSG.PLAYER_STOPPED, (msg) => {
  const state = useGameStore.getState();
  const isLocal = state.localPlayer?.id === msg.id;

  // Always update the store (handles both local and remote players).
  state.onPlayerStopped(msg);

  // For the local player, also snap the mesh immediately.
  if (isLocal && hasContext()) {
    getContext().players.snapToTile(msg.x, msg.z);
  }
});
