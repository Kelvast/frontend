- Remove `facing` from `sendPlayerMove` - server derives facing from the movement delta
- Gate `sendPlayerMove` calls to at most one per `TICK_INTERVAL_MS`
- Fix `player_stopped` handler - synthetic tick delta is missing `pace` at index `[5]`
- Implement `game-client/world/navmesh-ts` - A* over walkable tile grid, rebuild on chunk load/reload
- `snapToTile` utility - snap click ray-cast hit to tile centre before sending move packet
- Client-side movement prediction - advance position locally at server-resolved speed, reconcile on `player_stopped`
- Chunk streaming - load chunks outward from player position at runtime (spiral load pattern)
- Chunk unloading - dispose chunks beyond a max radius as the player moves
- Wire binary XOR+HMAC-2B channel for outbound action packets
- Wire `decrypt` into inbound message handler for binary game-loop frames
- Wire session key exchange - server sends key in `login_success`, client stores in memory only (never localStorage)
- Player mesh pooling - reuse `BABYLON-Mesh` objects on spawn/despawn
- HUD components: HP bar, XP per skill, inventory panel
- NPC rendering - `entities/npcs-ts` does not exist yet
- Quest state machine and UI
- Combat - melee range check, attack packet, death/respawn flow
- Canvas wiring - ground click (non-resource) → send `move` packet with target position
- Canvas wiring - click on actionable resource → if in range, send `action_start` packet with `action` type and `targetId`; if out of range, queue `move` to resource position followed by `action_start` on arrival
- Mirror per-player intent queue locally - keep client queue in sync with server for animation continuity
- Optimistic animation - start gather animation immediately on `action_start` send, do not wait for server confirmation
- On `action_finished` any reason - stop animation loop, clear local action state
- On `action_finished` success - call `store-addXp(skillId, xp)` and `store-addItem(itemId, qty)`
- On `resource_depleted` - mark resource as unclickable in scene
- On `resource_available` - mark resource as clickable in scene
- Block clicks on resources where `respawnAt` is set - unclickable until `resource_available` received
- Show gather chance in tooltip via `calcGatherChance` from `mmo-shared` - display only, never used for outcome


## Navmesh & Movement Refactor

### 1. navmesh.ts (new file — src/game-client/world/navmesh.ts)
- [ ] Define `NavNode` interface: `x`, `z`, `y` (TileHeight), `floor` (Floor), `worldY` (number), `walkable` (boolean), `blockedEdges` (number)
- [ ] Define `Navmesh` type as `Map<string, NavNode>`
- [ ] Export `navKey(x, z): string` — returns `"${x},${z}"`, single source of truth for map keys
- [ ] Export `buildChunkNavmesh(chunkData: ChunkData): Map<string, NavNode>` — iterates chunk tile grid, calls `TILE_WALKABLE[tile.type]` and `tileWorldY(tile.y)`, returns flat map of nodes keyed by `navKey`
- [ ] Export `mergeNavmesh(target: Navmesh, incoming: Map<string, NavNode>): void` — writes incoming nodes into target, overwrites on chunk reload

---

### 2. GameWorld (src/game-client/world/index.ts)
- [ ] Add `private navmesh: Navmesh` field, initialised as empty `Map`
- [ ] Add `getNavNode(x: number, z: number): NavNode | undefined` — single public accessor, replaces all `getTileAt` call sites
- [ ] Call `mergeNavmesh` inside `loadRegion` after each chunk is built
- [ ] Call `mergeNavmesh` inside `reloadChunk` to overwrite stale nodes
- [ ] Remove `getTileAt` once all call sites are migrated

---

### 3. Chunk (src/game-client/world/chunk.ts)
- [ ] Call `buildChunkNavmesh(data)` at the end of `spawn()`, return the result up to `GameWorld`
- [ ] Replace `buildChunkGrid` with per-walkable-tile pickable meshes — one `CreateGround` plane per walkable `NavNode`, named `tile-{tileX}-{tileZ}`, positioned at `worldY + epsilon`
- [ ] Set `isPickable = true` only on those tile meshes; merged visual mesh stays `isPickable = false`
- [ ] Track pickable tile meshes in a separate `private tileMeshes: Mesh[]` for disposal
- [ ] Add tile meshes to `dispose()`

---

### 4. PointerInput (src/game-client/systems/input-pointer.ts)
- [ ] Ray-cast filter changes to meshes named `tile-*` (was `grid-*`)
- [ ] Parse `tileX` and `tileZ` from `pickedMesh.name` — no world-space math needed, coords are in the name
- [ ] Remove all `world.getTileAt` / tile-height calls
- [ ] Call `sendPlayerMove(tileX, tileZ)` — destination only, nothing else
- [ ] Remove `PlayerManager` dependency from constructor — pointer only sends WS now

---

### 5. sendPlayerMove (src/ws/messages/move.ts)
- [ ] Simplify signature to `sendPlayerMove(destX: number, destZ: number): void`
- [ ] Remove `y`, `floor`, `pace` params — server derives all of these
- [ ] Message shape: `{ type: MSG.PLAYER_MOVE, x: destX, z: destZ }`

---

### 6. PlayerManager (src/game-client/entities/players.ts)
- [ ] Remove `moveTo(tileX, tileZ)` — this no longer exists
- [ ] Add `animatePath(path: PathStep[]): void` — receives server-resolved path, builds `Vector3[]` using `navmesh.getNavNode(step.x, step.z)!.worldY`, hands to `buildMoveAnimation`
- [ ] Remove `buildWaypoints` import and call
- [ ] Remove `sendPlayerMove` import and both call sites
- [ ] Remove `onArrival` callback — store sync moves to a new `player_move_ack` handler
- [ ] Remove `walkPace` field — server owns pace
- [ ] `GameWorld` passed in constructor is now used only for `getNavNode` lookups in `animatePath`

---

### 7. buildWaypoints (src/game-client/movement/waypoints.ts)
- [ ] Delete file — no longer used

---

### 8. WS protocol (mmo-shared — src/types/protocol.ts)
- [ ] Update `PLAYER_MOVE` client message: `{ type: "player_move", x: number, z: number }` — remove `y`, `floor`, `pace`
- [ ] Add `PLAYER_MOVE_ACK` server message: `{ type: "player_move_ack", path: PathStep[] }`
- [ ] Add `PathStep` type: `{ x: number, z: number, y: TileHeight, floor: Floor }`

---

### 9. player-move-ack.ts (new file — src/ws/messages/player-move-ack.ts)
- [ ] Register handler for `MSG.PLAYER_MOVE_ACK` in `registry.ts`
- [ ] Handler receives path, calls `players.animatePath(path)` via context

---

### 10. Server WS move handler (mmo-server)
- [ ] Update `PLAYER_MOVE` handler to receive `{ x, z }` only
- [ ] Run BFS/A* from player's current position to `{x, z}` against server tile data
- [ ] Send `PLAYER_MOVE_ACK` with full `PathStep[]` back to the requesting client
- [ ] Broadcast `PLAYER_MOVE` delta to other clients in range (existing behaviour, shape may need updating)
