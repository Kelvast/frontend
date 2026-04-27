1. Update `src/game-client/constants.ts` to import `CHUNK_SIZE` from `mmo-shared`
2. Implement `POST /api/auth/login` and `POST /api/auth/register` using `LoginRequest`, `RegisterRequest`, `AuthSuccessResponse`, `AuthErrorResponse` from `mmo-shared`
3. Add `pace` to `sendPlayerMove` - pass a `PaceMultiplier` number using `PACE_MULTIPLIER[mode]` from `mmo-shared`
4. Remove `facing` from `sendPlayerMove` - server derives facing from the movement delta
5. Gate `sendPlayerMove` calls to at most one per `TICK_INTERVAL_MS`
6. Fix `player_stopped` handler - synthetic tick delta is missing `pace` at index `[5]`
7. Implement `game-client/world/navmesh.ts` - A* over walkable tile grid, rebuild on chunk load/reload
8. `snapToTile` utility - snap click ray-cast hit to tile centre before sending move packet
9. Client-side movement prediction - advance position locally at server-resolved speed, reconcile on `player_stopped`
10. Chunk streaming - load chunks outward from player position at runtime (spiral load pattern)
11. Chunk unloading - dispose chunks beyond a max radius as the player moves
12. Wire binary XOR+HMAC-2B channel for outbound action packets
13. Wire `decrypt` into inbound message handler for binary game-loop frames
14. Wire session key exchange - server sends key in `login_success`, client stores in memory only (never localStorage)
15. Player mesh pooling - reuse `BABYLON.Mesh` objects on spawn/despawn
16. HUD components: HP bar, XP per skill, inventory panel
17. NPC rendering - `entities/npcs.ts` does not exist yet
18. Quest state machine and UI
19. Combat - melee range check, attack packet, death/respawn flow
20. Canvas wiring - ground click (non-resource) → send `move` packet with target position
21. Canvas wiring - click on actionable resource → if in range, send `action_start` packet with `action` type and `targetId`; if out of range, queue `move` to resource position followed by `action_start` on arrival
22. Mirror per-player intent queue locally - keep client queue in sync with server for animation continuity
23. Optimistic animation - start gather animation immediately on `action_start` send, do not wait for server confirmation
24. On `action_finished` any reason - stop animation loop, clear local action state
25. On `action_finished` success - call `store.addXp(skillId, xp)` and `store.addItem(itemId, qty)`
26. On `resource_depleted` - mark resource as unclickable in scene
27. On `resource_available` - mark resource as clickable in scene
28. Block clicks on resources where `respawnAt` is set - unclickable until `resource_available` received
29. Show gather chance in tooltip via `calcGatherChance` from `mmo-shared` - display only, never used for outcome
