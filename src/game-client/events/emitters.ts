import { GAME_EVENT } from "./game-event";
import { createEmitter } from "./helpers";

// Session
export const emitSessionOpened = createEmitter(GAME_EVENT.SESSION_OPENED);
export const emitSessionRejected = createEmitter(GAME_EVENT.SESSION_REJECTED);
export const emitSessionClosed = createEmitter(GAME_EVENT.SESSION_CLOSED);
export const emitSessionPlayerData = createEmitter(GAME_EVENT.SESSION_PLAYER_DATA);

// Player
export const emitPlayerMoveAcked = createEmitter(GAME_EVENT.PLAYER_MOVE_ACKED);
export const emitPlayerTick = createEmitter(GAME_EVENT.PLAYER_TICK);
export const emitPlayerArrived = createEmitter(GAME_EVENT.PLAYER_ARRIVED);
export const emitPlayerStopped = createEmitter(GAME_EVENT.PLAYER_STOPPED);

// Area
export const emitAreaWorldState = createEmitter(GAME_EVENT.AREA_WORLD_STATE);
export const emitAreaPlayerJoined = createEmitter(GAME_EVENT.AREA_PLAYER_JOINED);
export const emitAreaPlayerLeft = createEmitter(GAME_EVENT.AREA_PLAYER_LEFT);

// Action
export const emitActionStarted = createEmitter(GAME_EVENT.ACTION_STARTED);
export const emitActionOngoing = createEmitter(GAME_EVENT.ACTION_ONGOING);
export const emitActionFinished = createEmitter(GAME_EVENT.ACTION_FINISHED);

// World
export const emitWorldResourceDepleted = createEmitter(GAME_EVENT.WORLD_RESOURCE_DEPLETED);
export const emitWorldResourceAvailable = createEmitter(GAME_EVENT.WORLD_RESOURCE_AVAILABLE);

// Input
export const emitInputIntent = createEmitter(GAME_EVENT.INPUT_INTENT);
export const emitInputTileClicked = createEmitter(GAME_EVENT.INPUT_TILE_CLICKED);

// Bus
export const emitBusError = createEmitter(GAME_EVENT.BUS_ERROR);
