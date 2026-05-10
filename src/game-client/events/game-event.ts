import type { GameEventMap } from "./types";

/**
 * Canonical string keys for every event in GameEventMap.
 *
 * The `satisfies` constraint enforces at compile time that every value
 * is a valid GameEventMap key. Adding an entry here with a value that
 * doesn't exist in GameEventMap is a compile error.
 *
 * When adding a new event:
 *   1. Add it to GameEventMap in types.ts
 *   2. Add a matching entry here
 *   3. Add emitX to emitters.ts and onX to listeners.ts in the same PR
 */
export const GAME_EVENT = {
  // Session
  SESSION_OPENED: "session:opened",
  SESSION_REJECTED: "session:rejected",
  SESSION_CLOSED: "session:closed",
  SESSION_PLAYER_DATA: "session:player-data",

  // Player
  PLAYER_MOVE_ACKED: "player:move-acked",
  PLAYER_TICK: "player:tick",
  PLAYER_ARRIVED: "player:arrived",
  PLAYER_STOPPED: "player:stopped",

  // Area
  AREA_WORLD_STATE: "area:world-state",
  AREA_PLAYER_JOINED: "area:player-joined",
  AREA_PLAYER_LEFT: "area:player-left",

  // Action
  ACTION_STARTED: "action:started",
  ACTION_ONGOING: "action:ongoing",
  ACTION_FINISHED: "action:finished",

  // World
  WORLD_RESOURCE_DEPLETED: "world:resource-depleted",
  WORLD_RESOURCE_AVAILABLE: "world:resource-available",

  // Input
  INPUT_INTENT: "input:intent",
  INPUT_TILE_CLICKED: "input:tile-clicked",

  // Bus
  BUS_ERROR: "bus:error",
} as const satisfies Record<string, keyof GameEventMap>;
