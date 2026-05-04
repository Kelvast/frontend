## Outstanding

- Gate `sendPlayerMove` to at most one call per `TICK_INTERVAL_MS`
- Fix `player_stopped` handler - local player stopped not yet handled; server rejects silently from client perspective
- Client-side prediction - advance local player position at `ResolvedPace` tiles/sec between ticks; reconcile against `player_stopped`
- Chunk streaming - load chunks outward from player position at runtime (spiral load pattern)
- Chunk unloading - dispose chunks beyond a max radius as the player moves
- Mesh pool in `PlayerManager` - pre-allocate N meshes, lease on spawn, return on despawn instead of creating/destroying
- Apply mesh pool pattern to `NpcManager` once `plan/NPC.md` work is complete
- Wire binary XOR+HMAC-2B channel for outbound action packets
- Wire `decrypt` into inbound message handler for binary game-loop frames
- Wire session key exchange - server sends key in `session_opened`, client stores in memory only (never localStorage)
- HUD components: HP bar, XP per skill, inventory panel
- NPC rendering - `entities/npcs.ts` does not exist yet
- Quest state machine and UI
- Combat - melee range check, attack packet, death/respawn flow
- Canvas wiring - click on actionable resource → if in range, send `action_start` packet with `action` type and `targetId`; if out of range, queue `move` to resource position followed by `action_start` on arrival
- Mirror per-player intent queue locally - keep client queue in sync with server for animation continuity
- Optimistic animation - start gather animation immediately on `action_start` send, do not wait for server confirmation
- On `action_finished` any reason - stop animation loop, clear local action state
- On `action_finished` success - call `store.addXp(skillId, xp)` and `store.addItem(itemId, qty)`
- On `resource_depleted` - mark resource as unclickable in scene
- On `resource_available` - mark resource as clickable in scene
- Block clicks on resources where `respawnAt` is set - unclickable until `resource_available` received
- Show gather chance in tooltip via `calcGatherChance` from `mmo-shared` - display only, never used for outcome

## Navmesh & Movement Refactor

Remaining items only - completed items removed.

### 1. navmesh.ts — partial
- Add `blockedEdges` bitmask to `NavNode` - not yet used but required before diagonal/obstacle edge cases

### 2. GameWorld
- Remove `getTileAt` once all call sites confirmed migrated

### 3. Chunk
- Replace `buildChunkGrid` with per-walkable-tile pickable meshes - one `CreateGround` plane per walkable `NavNode`, named `tile-{tileX}-{tileZ}`, positioned at `worldY + epsilon`, `isPickable = true`; merged visual mesh stays `isPickable = false`
- Track pickable tile meshes in a separate `private tileMeshes: Mesh[]` for disposal; add to `dispose()`
