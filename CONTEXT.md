> For AI context only. Reflects current implementation reality, not aspirations.
> Last updated: 2026-03-20
> Active branch: nextjs-zustand

***

## Project

Browser-based 3D MMO client. Next.js (App Router) + Babylon.js + Zustand.
Server is a separate repo (`mmo-server`), written in Node.js/TypeScript, deployed to AWS EC2 via SST v3 IaC.

***

## Current Stack

- **Next.js** (App Router) — routing, login/register API routes, SSR shell
- **Babylon.js** — 3D rendering, scene, input
- **Zustand** — client game state (`src/utils/game-store.ts`)
- **TypeScript** — strict throughout
- **Tailwind CSS** — styling
- **WebSockets** — real-time server connection (`src/utils/ws-client.ts`)
- **Axios** — HTTP wrapper (`src/utils/http.ts`)

***

## Folder Structure (actual)

```bash
src/
├── app/
│   ├── api/                        # Next.js API routes (login, register)
│   ├── game/                       # Game page
│   ├── login/                      # Login page
│   ├── layout.tsx                  # Root layout
│   ├── page.ts                     # Root redirect
│   ├── error.ts          
│   └── not-found.ts          
├── game-client/          
│   ├── index.ts                    # initGame / connectGame / destroyGame singleton
│   ├── engine.ts                   # GameEngine class (Babylon Engine + Scene)
│   ├── camera.ts                   # GameCamera class (arc rotate, WASD camera only)
│   ├── input.ts                    # Click → snapToTile → sendPlayerUpdate
│   ├── constants.ts                # TILE_SIZE, CHUNK_SIZE, camera constants
│   ├── entities/         
│   │   ├── players.ts              # PlayerManager class — local + remote player meshes
│   │   └── npcs.ts                 # Empty placeholder — not yet implemented
│   └── world/          
│       ├── index.ts                # GameWorld class
│       ├── chunk.ts                # Chunk class — spawns/disposes tile meshes from ChunkData
│       ├── tile-config.ts          # TILE_CONFIG — color + walkable per TileType
│       └── regions/
│           └── spawn/
│               └── chunk-1.ts      # First hand-authored ChunkData (16×16 tile grid)
├── presentation/
│   ├── 1-atoms/
│   ├── 2-molecules/
│   ├── 3-organisms/                # GameCanvas, LoginForm
│   ├── 4-layouts/          
│   └── 5-pages/          
├── types/          
│   ├── index.ts                    # Re-exports all mmo types
│   └── mmo/          
│       ├── world.ts                # TileType, TileHeight, TILE_WALKABLE, Tile, tile(), ChunkData, Region, World
│       ├── player.ts               # PlayerStats, PlayerState
│       ├── position.ts             # Position, Rotation
│       ├── network.ts              # WSMessage union, PlayerInitMsg, TickMsg, PlayerDelta — canonical protocol contract
│       ├── game-state.ts           # GameStoreState
│       └── entities.ts             # (stub)
├── utils/          
│   ├── game-store.ts               # Zustand store
│   ├── ws-client.ts                # WebSocket connection + message handling
│   ├── http.ts                     # Axios wrapper
│   ├── response.ts                 # API response helpers
│   └── site.ts                     # Site metadata / config helpers
└── config/                         # App-level config

```

***

## What Is Actually Built

| File | Status |
| :-- | :-- |
| Next.js app shell, routing, login page | ✅ Built |
| `game-client/engine.ts` — `GameEngine` | ✅ Built |
| `game-client/camera.ts` — `GameCamera` | ✅ Built |
| `game-client/input.ts` — click → move | ✅ Built |
| `game-client/entities/players.ts` — `PlayerManager` | ✅ Built |
| `game-client/world/chunk.ts` — `Chunk` class | ✅ Built |
| `game-client/world/tile-config.ts` — `TILE_CONFIG` | ✅ Built |
| `game-client/world/regions/spawn/chunk-1.ts` | ✅ Built (hand-authored tile data) |
| `utils/game-store.ts` — Zustand store | ✅ Built |
| `utils/ws-client.ts` — WebSocket client | ✅ Built |
| `types/mmo/world.ts` — all world types | ✅ Built |
| `types/mmo/player.ts` — PlayerState | ✅ Built |
| `types/mmo/network.ts` — WSMessage, PlayerInitMsg, TickMsg | ✅ Built |
| `game-client/entities/npcs.ts` | ⬜ Empty placeholder |
| Chunk manager (load/unload on movement) | ⬜ Not yet built |
| Server: player_init / tick / player_leave protocol | ⬜ Not yet built (client ready, server pending) |
| Skills, combat, inventory, quests | ⬜ Not yet built |

***

## Zustand Store (current, from `src/utils/game-store.ts`)

```ts
{
  myId:             string | null
  player:           PlayerState | null
  nearbyPlayers:    PlayerState[]
  worldTime:        number
  isConnected:      boolean
  latency:          number
  sessionToken:     string | null
  sessionExpiresAt: number | null
  indexRegistry:    Map<number, string>   // session index → player id

  // actions
  setMyId(id: string): void
  setConnected(connected: boolean): void
  setLatency(latency: number): void
  setSession({ sessionToken, sessionExpiresAt }): void
  updatePlayer(player: PlayerState): void          // local player hydration from legacy state tick
  registerPlayer(msg: PlayerInitMsg): void         // upserts player + sets index registry entry
  unregisterPlayer(index: number): void            // removes player + cleans index registry
  applyTick(msg: TickMsg): void                    // applies delta updates in single pass
}
```


***

## Network Protocol (canonical contract)

`src/types/mmo/network.ts` is the **source of truth** for all WS message shapes. The server's
`src/types/network.ts` must be kept manually in sync with this file. Do not diverge them.

```ts
// Server → Client

interface PlayerInitMsg {
  type: "player_init"
  index: number       // session-scoped integer, used for delta updates
  id: string          // persistent UUID
  name: string
  hp: number
  maxHp: number
  x: number           // world tile x
  y: number           // world tile y
}

type PlayerDelta = [index: number, x: number, y: number, facing: number, hp: number]

interface TickMsg {
  type: "tick"
  t: number           // server timestamp ms
  p: PlayerDelta[]    // only players whose state changed since last tick
}

interface PlayerLeaveMsg {
  type: "player_leave"
  index: number
}

interface LoginSuccessMsg {
  type: "login_success"
  index: number
  id: string
  x: number
  y: number
  hp: number
  sessionToken: string
  sessionExpiresAt: number
}

interface AuthFailMsg {
  type: "auth_fail"
  message: string
}

// Client → Server

interface LoginPacket {
  type: "login"
  email: string
  pass: string
}

interface RegisterPacket {
  type: "register"
  name: string
  email: string
  pass: string
}

interface ResumePacket {
  type: "resume"
  token: string
}

interface ClickPacket {
  type: "click"
  targetX: number
  targetY: number
}
```


### Legacy Bridge (temporary, remove once server updated)

The server currently sends `{ type: "state", players: [...] }` and `{ type: "loginSuccess", ... }`.
These are bridged in `ws-client.ts` until the server is updated to emit the canonical protocol above.

***

## Client / Server Validation Boundary

**This is a firm architectural contract.**

### Client is responsible for:

- All UI-level input validation before any packet is sent:
    - Email format checks
    - Password length / complexity requirements
    - Name length and allowed character checks
    - Click target is a valid walkable tile (via `TILE_WALKABLE`)
    - No packets sent while `!isConnected`
- Preventing duplicate actions (e.g. double-clicking while already moving)
- Session expiry detection — refresh or re-auth before sending packets


### Server is responsible for:

- Auth validation only: bcrypt compare, session token validity, expiry timestamp
- Game-logic boundary checks: target tile reachability, movement rate limiting (future)
- Rejecting any structurally invalid packet (missing `type` field, unknown type)
- Never trusting `ws.playerId` — always cross-reference against the `players` Map
- Being the **sole authority on game state** — client is display-only


### What the server deliberately does NOT do:

- Email format validation
- Password length / complexity checks
- Name format validation
- Any client-side UX concern

This split exists for performance and architectural clarity. It is **not** a security shortcut —
the server always remains authoritative on all game state and auth decisions.

***

## WebSocket Message Handling (current, from `src/utils/ws-client.ts`)

| Message | Handler |
| :-- | :-- |
| `auth_fail` | logs failure, shows UI error |
| `login_success` | `setMyId`, `setSession` |
| `state` | **legacy bridge** → `registerPlayer` per player, `unregisterPlayer` for departed (remove once server updated) |
| `player_init` | `registerPlayer` |
| `player_leave` | `unregisterPlayer(data.index)` |
| `tick` | `applyTick` |


***

## World Types (current, from `src/types/mmo/world.ts`)

```ts
enum TileType { GRASS | WATER | STONE | SAND | PATH }

const TileHeight = { GROUND: 0, SLOPE_LOW: 0.25, SLOPE_MID: 0.5, SLOPE_HIGH: 0.75,
                     FIRST_FLOOR: 1, SECOND_FLOOR: 2, THIRD_FLOOR: 3 } as const
type TileHeight = typeof TileHeight[keyof typeof TileHeight]

interface Tile { type: TileType; y: TileHeight }
const tile = (type: TileType, y: TileHeight = TileHeight.GROUND): Tile => ({ type, y })

interface ChunkData {
  chunkX: number; chunkZ: number; region: string; tiles: Tile[][]  // 16×16
}

interface Region {
  id: string; name: string; pvp: boolean
  spawnPoint: { x: number; z: number }
  chunks: Record<string, ChunkData>  // key: "chunkX,chunkZ"
}

interface World { regions: Record<string, Region> }
```


***

## Locked Decisions

- **Chunks are terrain only** — no NPCs, no spawn points, no interactables in `ChunkData`
- **NPCs will have their own type** with a fixed home position `(x, y, z)` in world coords, defined externally
- **Spawn points are external** — coordinates passed to entities at runtime, not baked into map data
- **All systems speak world coords `(x, y, z)`** — chunk/region always derived, never stored on entities
- **Chunks are static and cacheable** — fetched once per session, keyed `"chunkX,chunkZ"`, LRU eviction when out of range
- **Chunk loading is client-driven** — client fetches tile data directly, game server only tracks which chunk a player is in
- **Tiered world loading order**: world map → terrain → objects/interactables → entities
- **`TileHeight` is a const object + type** (not an enum)
- **`TILE_CONFIG`** is the rendering source of truth — maps `TileType` to Babylon `Color3` + walkable flag
- **`TILE_WALKABLE`** in types is the logic source of truth — `TILE_CONFIG.walkable` mirrors it in the client
- **WASD moves camera only**, never the player
- **Server ticks every 100ms** — delta updates batched, combat/death events immediate
- **Session index** — client fully implemented; server still sends legacy `state` broadcasts (bridged client-side, TODO)
- **`player` field in store is unused** — `nearbyPlayers` is the single source of truth; local player identified via `myId`
- **`src/types/mmo/network.ts` is the canonical protocol contract** — server must match it, not the other way around

***

## Coordinate System

- World tile coords: `x, z` (integer), `y` = `TileHeight`
- Chunk from tile: `chunkX = Math.floor(x / CHUNK_SIZE)` — `CHUNK_SIZE = 16`
- Local tile in chunk: `localX = x % CHUNK_SIZE`
- World pixel pos: `worldX = (chunkX * CHUNK_SIZE + localX) * TILE_SIZE` — `TILE_SIZE = 32`

***

## Pending / Not Yet Built

- [ ] Server: emit `player_init` / `tick` / `player_leave` — client already handles these
- [ ] Wire `nearbyPlayers` from store into Babylon `PlayerManager` so meshes spawn/despawn/move
- [ ] Chunk manager — load/unload/cache chunks around player on movement
- [ ] `TileHeight` — sloped and multi-floor terrain rendering
- [ ] Region system wired up client-side
- [ ] NPC type, registry, and `npcs.ts` implementation
- [ ] Skills system
- [ ] Combat system
- [ ] Inventory system
- [ ] Quest system
- [ ] Interactables registry

***

## Naming Conventions

- Files: `kebab-case.ts` / `PascalCase.tsx` for components
- Classes: `PascalCase` (`GameEngine`, `PlayerManager`)
- Functions: `camelCase` (`initGame`, `snapToTile`, `connectWS`)
- Types/Interfaces: `PascalCase` (`Tile`, `PlayerState`, `WSMessage`)
- Constants: `UPPER_SNAKE_CASE` (`TILE_SIZE`, `CHUNK_SIZE`, `TILE_CONFIG`)
- WS message types: `snake_case` strings (`player_move`, `player_join`)
- Zustand actions: `camelCase` prefixed with verb (`setMyId`, `registerPlayer`)


***

## Network Protocol Findings (2026-03-22)

**Status**: Finalized for `mmo-shared` package implementation  
**Next Phase**: Create `mmo-shared` package with unified protocol layer

### Wire Protocol Architecture

**Unified Message Format** — All world actions use identical 4-tuple shape:
```
[r, s, t, id]
where:
  r = request type (0-15 registered types)
  s = skill ID (0-31 per SKILL_REGISTRY)
  t = resource type / amount / context (0-255 per RESOURCE_TYPE_REGISTRY)
  id = entity / tile / player ID
```

**Binary Encoding**: `Uint16Array(4) = 8 bytes` per message

### Message Types Registry

| r | Direction | Message | Description |
|---|---|---|---|
| **0** | Inbound | `action_start` | Begin gather/action (anim sync) |
| **1** | Inbound | `action_finish` | Complete action (roll happens server-side) |
| **2** | Outbound | `player_state` | Nearby player state change (idle/busy) |
| **3** | Outbound | `anim_start` | Nearby player started action |
| **4** | Outbound | `spawn` | Item/entity spawned nearby |
| **5** | Outbound | `despawn` | Item/entity removed |
| **6** | Outbound | `respawn` | Resource back after timer |
| **7** | Outbound | `inventory_update` | Self: slot changed |
| **8** | Outbound | `xp_update` | Self: XP batch confirmed |
| **9** | Outbound | `init` | Login/session init state |
| **10** | Outbound | `tick` | Nearby player delta positions |
| **11** | Bidirectional | `ping` | Latency check |
| **12** | Inbound | `move` | Click-to-move target tile |
| **13** | Inbound | `equip` | Equip item from inventory |
| **14** | Inbound | `drop` | Drop item to ground |
| **15** | Inbound | `pickup` | Pick up ground item |

### Security Architecture — XOR + HMAC-2B

**Why not full encryption?** Option benchmarks (100k iterations):
- ChaCha20: 4,042ns mean → slightly slower
- **XOR + HMAC-2B: 3,343ns mean → fastest, minimal overhead**
- AES-128-GCM: 4,943ns → overkill for game logic

**Chosen**: XOR + HMAC-2B (truncated SHA-256)

**Wire format** (12 bytes):
```
[encrypted_8b] + [hmac_2b_sig] = 12 bytes total
```

**Key Exchange** (per session):
1. Client connects → Server generates `sessionKey` (32 bytes random, unique per socket)
2. Server sends init over WSS (TLS protects the key delivery)
3. Client stores key in memory — never sends it
4. All messages encrypted with same key, different nonce per message

**Anti-tamper**:
- HMAC-2B is keyed — cannot be forged without session key
- Nonce increments per message — blocks replay attacks
- Server verifies signature before decryption — rejects tampered early

**What This Stops**:
- ✅ Passive packet sniffing (ISP, network observer)
- ✅ Automated bot replication (packet replay)
- ✅ Script kiddies (requires JS decompilation + key extraction)
- ❌ Determined cheater with DevTools (key is in browser memory)

### Server-Side Validation (The Real Security)

**Client sends intent, server computes outcome**:

```ts
// Client (optimistic, local validation first)
if (isWithinRange(targetTile, 1) && canGather()) {
  send([0, skillId, resourceType, entityId])  // action_start
}

// Server (authoritative, stateless)
if (validBusy(player) && validTile(entityId)) {
  roll = Math.random()
  success = roll < RESOURCE_REGISTRY[resourceType].successRate
  if (success) {
    xpGain = RESOURCE_REGISTRY[resourceType].xp  // DERIVED, not trusted
    player.pendingXp[skillId] += xpGain
    broadcastNearby([2, skillId, 0, playerIndex])  // player_state idle
  }
}
```

**Keys**:
- **No XP from client** — server derives entirely from resource type
- **Range checking** — server validates tile/entity exists within world
- **Cooldown anti-spam** — server timer prevents fast clicking
- **Location validation** — if no nearby resource of that type, reject

### Shared Registry (`mmo-shared` Package)

**Exports** (imported by both client + server):

```ts
SKILL_REGISTRY: Record<number, { name, maxLevel }>
RESOURCE_TYPE_REGISTRY: Record<number, { xp, successRate, respawnMs, animId, skill }>
REST_TYPES: Record<number, { name, direction }>

encrypt(payload, key, nonce): Buffer
decrypt(payload, key, nonce): Uint16Array
xpToLevel(xp): number  // pure fn, identical both sides
encodeTileId(x, z): number
decodeTileId(id): [x, z]
```

**Single source of truth** — registry changes sync both repos instantly

### Scaling at 500 DAU

| Metric | Value | Impact |
|---|---|---|
| **Inbound msgs/mo** | 1.8M | ~72 msg/min per player |
| **Outbound msgs/mo** | 1.5M | Broadcasts to nearby (20 players max) |
| **Total GB/mo** | 0.061GB | **~$0.61/mo post-free tier** |
| **Per-user cost** | $0.0036/mo | Negligible |

**Bottle necks**: None at this scale — WS frame parsing is bottleneck, not crypto

### Client vs Server Responsibilities

**Client**:
- Pathfinding (removed from server)
- Animation playback
- UI/inventory display
- Local XP/level calculation (Zustand)
- Range validation (range check before sending)

**Server**:
- Probability rolls (succeed/fail)
- XP awarding (derived from registry)
- World state (tile/entity existence)
- Cooldown tracking
- Broadcast to nearby players
- Encryption/decryption

**Chat/Trading**: Separate JSON-based protocol (variable length, not 4-tuple)

### Files to Create in `mmo-shared`

```
mmo-shared/
  src/
    types/
      protocol.ts        # GameMessage type, REQUEST_TYPES enum
      registries.ts      # SKILL_REGISTRY, RESOURCE_TYPE_REGISTRY
    crypto/
      index.ts           # encrypt/decrypt using XOR + HMAC-2B
    utils/
      encoding.ts        # encodeTileId, decodeTileId
      xp.ts              # xpToLevel pure function
    index.ts             # re-exports all
```

### Migration Path

**Phase 1** (now):
- Create `mmo-shared` package
- Move protocol constants, registries, utilities
- Update `network.ts` to import from shared
- Update server to import from shared
- Both repos use identical encrypt/decrypt

**Phase 2** (later):
- Add analytics logging (server-side only)
- Implement server-side location tracking for cheat detection
- Upgrade to ChaCha20-Poly1305 (swap crypto functions only, no protocol change)
- Add nonce rotation per 5 minutes

### Why This Works

1. **Lean wire format** — 8B + 4B overhead = 12B, same shape for all actions
2. **Stateless server** — no per-player action queues, just math
3. **Client optimistic** — XP/UI instant, server confirms correctness later
4. **Anti-cheat layered** — encryption raises bar, server validation is the real wall
5. **Scalable registries** — add new items/skills without protocol changes
6. **Shared code** — no drift between client/server logic (xpToLevel, etc)

### Outstanding Notes

- Chat system will use separate JSON protocol (r=20+, variable length)
- Trading system will use JSON with item arrays (complex negotiation state)
- Both will still use same WS encryption, just different message shapes
- Client-side location validation prevents server thrash; server is fallback
- Non-extractable Web Crypto keys (CryptoKey) add browser-native security layer
