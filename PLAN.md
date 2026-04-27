# MMO Client — Development Plan

## Project Summary

The Babylon.js client for the tile-based MMO. Built with Next.js, React, and Babylon.js. The client is responsible for rendering, interpolation, pathfinding, and UI — all game state authority lives on the server.

**Stack:** TypeScript · Next.js · React · Babylon.js · Zustand · WebSocket (`ws-client.ts`)

**Key constraint:** All shared types, opcodes, packet layouts, and enums MUST be defined in `mmo-shared` first. The client imports from there — never define game types locally if they're used across repos.

---

## Architecture Decisions

These are settled. Do not suggest alternatives unless explicitly asked.

- **Babylon.js owns the canvas.** The render loop runs independently of React. Never manipulate meshes from a React component. Never dispatch Zustand actions from inside the render loop (except debug tooling).
- **Zustand is the bridge.** The render loop reads state via `useGameStore.getState()`. React re-renders only for UI state (HUD, inventory, login).
- **The client is not authoritative.** It runs pathfinding for UX smoothness only. The server validates every move. On `player_stopped`, discard waypoints and snap.
- **Binary packets match the server.** Once the binary channel is active, outbound packets use `PacketWriter` from `mmo-shared`. Inbound packets use `PacketReader`. No JSON on the hot path.
- **No client-side prediction yet.** Displayed position only updates on tick deltas. Lag of up to one tick interval (300ms) is acceptable until prediction is added.
- **Client-side pathfinding, server-side per-step validation.** The client runs A* and sends the full path (`MoveIntentPacket`) to the server. The server does not re-run A*. On rejection, snap back.
- **The navmesh is client-only.** Built from `ChunkData` tile arrays after world load. Rebuilt on chunk load/reload. Server has no navmesh.
- **All inbound WS messages are wrapped in try/catch.** Unknown or malformed messages are logged and dropped — never thrown. The client must not crash from bad server data.
- **Move packets are gated at one per tick.** Never send move packets faster than `TICK_INTERVAL_MS`.

---

## Foundation — Build in this order

These are the only things with a required sequence. Each step has a hard dependency on the one before it.

### 1. `mmo-shared` binary types and packet utilities

**Must exist before any binary packet work on the client is started.**

- `ServerOpcode` and `ClientOpcode` enums
- `PacketWriter` and `PacketReader` utilities
- `MoveIntentPacket`, `TilePath`, `TileCoord` types
- `serverTimestamp` field on `TickPacket`
- All binary layouts documented

---

### 2. WS client — binary message handler

**Replace JSON parsing with opcode-byte dispatch. Must match the server's binary format.**

Tasks:

- [ ] Replace inbound JSON parsing with `PacketReader` opcode-byte dispatch in `ws-client.ts`
- [ ] Replace outbound `JSON.stringify` with `PacketWriter` writes
- [ ] Wrap every inbound message handler in try/catch — log warn, continue (never throw)
- [ ] Fix `player_stopped` handler — synthetic tick delta is missing `pace` at index `[5]`
- [ ] Wire `decrypt` into inbound message handler for binary game-loop frames
- [ ] Wire `encrypt` into outbound action packets
- [ ] Wire session key exchange — server sends key in `login_success`, client stores in memory only (never localStorage)

---

### 3. Auth / login flow

**Players need to be able to log in before anything can be tested.**

Tasks:

- [ ] Implement `POST /api/auth/login` and `POST /api/auth/register` Next.js API routes using types from `mmo-shared`
- [ ] Gate move packets — one per `TICK_INTERVAL_MS` maximum
- [ ] Add `pace` to `sendPlayerMove` — pass a `PaceMultiplier` number using `PACE_MULTIPLIER[mode]` from `mmo-shared`
- [ ] Remove `facing` from `sendPlayerMove` — server derives facing from movement delta

---

### 4. Navmesh and pathfinding

**Needed before click-to-move can work correctly. Must load the same collision map the server uses.**

Tasks:

- [ ] Implement `game-client/world/navmesh.ts` — A* over walkable tile grid
- [ ] Rebuild navmesh on `loadAllRegions` completion
- [ ] Rebuild incrementally on `reloadChunkFromApi` (SSE hot-reload)
- [ ] `snapToTile` utility — snap click ray-cast hit to tile centre before sending move packet
- [ ] Verify client loads the same S3 collision map asset as the server — both must reference the same asset version

---

### 5. Movement — MoveIntentPacket path sending

**Depends on: navmesh (step 4), binary WS client (step 2), `MoveIntentPacket` from `mmo-shared`.**

Tasks:

- [ ] Canvas wiring — ground click (non-resource) → run A*, send `MoveIntentPacket` with full path
- [ ] Path execution — advance along waypoints each frame at server-resolved speed (`PlayerDelta[5]`)
- [ ] On `player_stopped` — clear waypoints, snap to authoritative position
- [ ] Client-side movement prediction — advance position locally, reconcile on `player_stopped` (future improvement)
- [ ] Chunk streaming — load chunks outward from player position at runtime (spiral load pattern)
- [ ] Chunk unloading — dispose chunks beyond a max radius as the player moves

---

## Systems — add in any order after Foundation

All systems below are independent. There is no required order between them. The only intra-system notes:

- **Action/gathering** — needs canvas click wiring (Foundation step 5) to distinguish ground vs resource clicks
- **Combat** — needs NPC rendering to exist first
- **Shop** — needs inventory UI

---

### HUD & UI

**Goal:** Core in-game UI — health bar, XP bars, inventory panel.

Tasks:

- [ ] HP bar component — reads `maxHpFromSkills` and current HP from store
- [ ] XP per skill display — reads `PlayerState.skills`, calls `xpToLevel` / `xpToNextLevel` from `mmo-shared`
- [ ] Inventory panel — 28-slot grid, renders `PlayerState.inventory`
- [ ] Equipment panel — renders `PlayerState.equipment` slots

---

### NPC rendering

**Goal:** NPCs exist in the Babylon scene, broadcast from the server the same way players are.

Tasks:

- [ ] Create `entities/npcs.ts` — `NpcManager` mirroring `PlayerManager` pattern
- [ ] Handle `npc_join`, `npc_leave`, `npc_tick` packets in `ws-client.ts`
- [ ] Sync NPC meshes each frame via `syncNpcs(nearbyNpcs)` in the render loop
- [ ] NPC name label above mesh

---

### Action system (gathering)

**Goal:** Click on a resource node to gather — start animation, receive results, handle depletion.

Tasks:

- [ ] Canvas wiring — click on actionable resource → if in range, send `action_start` packet; if out of range, queue move then send on arrival
- [ ] Mirror per-player intent queue locally for animation continuity
- [ ] Optimistic gather animation — start immediately on `action_start` send, do not wait for server
- [ ] On `action_finished` (any reason) — stop animation, clear local action state
- [ ] On `action_finished` (success) — call `store.addXp(skillId, xp)` and `store.addItem(itemId, qty)`
- [ ] On `resource_depleted` — mark resource as unclickable in scene
- [ ] On `resource_available` — mark resource as clickable in scene
- [ ] Block clicks on resources where `respawnAt` is set
- [ ] Show gather chance in tooltip via `calcGatherChance` from `mmo-shared` — display only

---

### Inventory interactions

**Goal:** Player can drop, equip, and unequip items from the inventory panel.

Tasks:

- [ ] Drop item — right-click → send `drop_item` packet, await `inventory_update` from server
- [ ] Equip/unequip — click → send `equip_item` / `unequip_item`, await `inventory_update`
- [ ] Ground item rendering — handle `ground_item_spawn` / `ground_item_despawn` in scene
- [ ] Pickup — click ground item → send `pickup_item`, await `inventory_update`

---

### Combat

**Goal:** Click NPC to attack. Display hit splats. Handle death and respawn. Needs NPC rendering.

Tasks:

- [ ] Melee range check before sending `attack_intent`
- [ ] Handle `combat_hit` — display hit splat above target mesh
- [ ] Handle `combat_death` — play death animation, remove mesh temporarily
- [ ] Handle `combat_respawn` — respawn NPC mesh at new position
- [ ] Death/respawn flow for local player — respawn screen, teleport to spawn

---

### Skills display

**Goal:** Show all skill levels and XP progress in a skills panel.

Tasks:

- [ ] Skills panel — lists all `SkillId` values, current level, XP bar to next level
- [ ] Level-up notification — handle `level_up` packet, show animated overlay

---

### Player mesh pooling

**Goal:** Reuse `BABYLON.Mesh` objects on player spawn/despawn to avoid GC pressure.

Tasks:

- [ ] Mesh pool in `PlayerManager` — pre-allocate N meshes, lease on spawn, return on despawn
- [ ] Apply same pattern to NPC meshes once NPC rendering is in place

---

### Chat

**Goal:** Local, party, guild, and global chat channels in-game.

Tasks:

- [ ] Chat input component and message feed UI
- [ ] Handle `chat_message` packet — display in feed with channel label
- [ ] Send `chat_send` packet on submit
- [ ] Channel selector (local / party / guild / global)

---

### Bank UI

**Goal:** Open the bank interface at bank objects/NPCs, deposit and withdraw items.

Tasks:

- [ ] Handle `bank_open` packet — render 400-slot bank panel
- [ ] Deposit — drag from inventory to bank, send `bank_deposit`
- [ ] Withdraw — drag from bank to inventory, send `bank_withdraw`
- [ ] Handle `bank_close` — close the panel

---

### Shop UI

**Goal:** Buy and sell items at NPC shops. Needs inventory.

Tasks:

- [ ] Handle `shop_open` — render shop stock panel
- [ ] Buy — click item, send `shop_buy`, await `inventory_update`
- [ ] Sell — drag from inventory, send `shop_sell`, await `inventory_update`
- [ ] Handle `shop_close`

---

### Quest system

**Goal:** Quest state machine and UI for tracking active quests and objectives.

Tasks:

- [ ] Quest log UI — lists active and completed quests
- [ ] Quest state machine — tracks objective completion client-side
- [ ] Quest objective notifications
