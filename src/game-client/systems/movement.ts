/*
 * MovementSystem — processes pending move intents each tick and
 * drives entity positions toward their destinations.
 *
 * Currently movement is handled directly inside PlayerManager using
 * Babylon's built-in Animation system. This file is the future home
 * for a proper tick-driven movement system once the server sends
 * authoritative position updates.
 *
 * TODO: replace PlayerManager.moveTo animation with server-authoritative
 *       movement — receive waypoints from WS, interpolate client-side
 * TODO: pathfinding integration (A* over tile graph)
 * TODO: obstacle avoidance and tile walkability checks
 * TODO: remote player interpolation (dead reckoning)
 */
export {};
