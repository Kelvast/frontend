import { GAME_EVENT } from "./game-event";
import { createListener } from "./helpers";

// Session
export const onSessionOpened = createListener(GAME_EVENT.SESSION_OPENED);
export const onSessionRejected = createListener(GAME_EVENT.SESSION_REJECTED);
export const onSessionClosed = createListener(GAME_EVENT.SESSION_CLOSED);
export const onSessionPlayerData = createListener(GAME_EVENT.SESSION_PLAYER_DATA);

// Player
export const onPlayerMoveAcked = createListener(GAME_EVENT.PLAYER_MOVE_ACKED);
export const onPlayerTick = createListener(GAME_EVENT.PLAYER_TICK);
export const onPlayerArrived = createListener(GAME_EVENT.PLAYER_ARRIVED);
export const onPlayerStopped = createListener(GAME_EVENT.PLAYER_STOPPED);

// Area
export const onAreaWorldState = createListener(GAME_EVENT.AREA_WORLD_STATE);
export const onAreaPlayerJoined = createListener(GAME_EVENT.AREA_PLAYER_JOINED);
export const onAreaPlayerLeft = createListener(GAME_EVENT.AREA_PLAYER_LEFT);

// Action
export const onActionStarted = createListener(GAME_EVENT.ACTION_STARTED);
export const onActionOngoing = createListener(GAME_EVENT.ACTION_ONGOING);
export const onActionFinished = createListener(GAME_EVENT.ACTION_FINISHED);

// World
export const onWorldResourceDepleted = createListener(GAME_EVENT.WORLD_RESOURCE_DEPLETED);
export const onWorldResourceAvailable = createListener(GAME_EVENT.WORLD_RESOURCE_AVAILABLE);

// Input
export const onInputIntent = createListener(GAME_EVENT.INPUT_INTENT);
export const onInputTileClicked = createListener(GAME_EVENT.INPUT_TILE_CLICKED);

// Bus
export const onBusError = createListener(GAME_EVENT.BUS_ERROR);
