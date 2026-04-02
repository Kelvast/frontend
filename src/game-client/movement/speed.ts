// Movement speed logic now lives in mmo-shared so the server can reuse it.
// Re-exported here so existing client imports continue to resolve.
export { calcMoveSpeed, PACE_MULTIPLIER } from "mmo-shared";
export type { MovementType } from "mmo-shared";
