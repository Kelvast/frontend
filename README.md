# mmo-client

Browser-based 3D MMO client. Players move around a tile-based world, interact with other players in real time, and progress through skills, combat, and quests. Built with Next.js, Babylon.js, and Zustand.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| 3D Engine | Babylon.js |
| State | Zustand |
| Real-time | WebSocket (`ws-client.ts`) |
| HTTP | Axios wrapper (`http.ts`) |
| Language | TypeScript — strict throughout |
| Shared types | `mmo-shared` (local package) |

---

## Branch

Active development is on **`nextjs-zustand`**. All PRs target this branch.

---

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_MMO_SERVER_URL` | WebSocket server — e.g. `ws://localhost:8080` |
| `NEXT_PUBLIC_DEV_MODE` | Set `true` to enable verbose logger output |
| `NEXT_PUBLIC_DEV_EMAIL` | Dev auto-login email (dev mode only) |
| `NEXT_PUBLIC_DEV_PASSWORD` | Dev auto-login password (dev mode only) |

---

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run format   # prettier format
```

---

## Folder Structure

```
src/
├── app/
│   ├── api/                # Next.js API routes — login, register
│   ├── login/              # Login page
│   ├── game/               # Game page
│   └── layout.tsx          # Root layout
│
├── game-client/            # All Babylon.js game logic — no React inside here
│   ├── index.ts            # initGame / connectGame / destroyGame singleton
│   ├── engine.ts           # GameEngine — Babylon Engine + Scene bootstrap
│   ├── camera.ts           # GameCamera — arc-rotate, WASD orbit, player follow
│   ├── input.ts            # GameInput — keyboard tracking, click target
│   ├── constants.ts        # WORLD, CAMERA, PLAYER, CHUNK_MANAGER, MOVEMENT constants
│   ├── entities/
│   │   ├── players.ts      # PlayerManager — spawn, update, remove, syncPlayers
│   │   └── npcs.ts         # NPC rendering (stub)
│   └── world/
│       ├── index.ts        # GameWorld — lighting, chunk lifecycle
│       ├── chunk.ts        # Chunk class — spawns/disposes 16×16 tile meshes
│       ├── tile-config.ts  # Tile type → colour mapping
│       └── regions/        # Static chunk data per region
│           └── spawn/      # Spawn region chunk files
│
├── presentation/
│   ├── 1-atoms/            # Buttons, inputs
│   ├── 2-molecules/        # Form fields, UI groups
│   ├── 3-organisms/        # GameCanvas, LoginForm
│   ├── 4-layouts/          # BaseLayout
│   └── 5-pages/            # GamePage, LoginPage
│
├── types/
│   ├── index.ts            # Re-exports all types
│   ├── ws-protocol.ts      # WS message types
│   └── mmo/
│       ├── world.ts        # World, Region, Chunk, ChunkData, Tile types
│       ├── player.ts       # Player types
│       ├── entities.ts     # NPC and entity types
│       ├── game-state.ts   # GameStoreState, PlayerState, Stats
│       ├── network.ts      # Network message types
│       └── position.ts     # Position type
│
└── utils/
    ├── game-store.ts       # Zustand store
    ├── ws-client.ts        # WebSocket connection + message dispatch
    ├── http.ts             # Axios wrapper
    ├── logger.ts           # Centralised logger — never use raw console.log
    ├── response.ts         # API response helpers
    ├── site.ts             # Site metadata helpers
    └── dev.ts              # Dev credential helpers
```

---

## Game Systems

### Movement

Players move by clicking a tile on the ground. The click is snapped to the nearest tile centre and a `player_move` message is sent to the server. Remote players are smoothed to their new position each render frame using `Vector3.Lerp` at `PLAYER.LERP_SPEED`. WASD moves the camera only, not the player.

Movement constants (`constants.ts`):

| Constant | Value | Description |
|---|---|---|
| `MOVEMENT.TILE_DURATION_MS` | 600 | ms to traverse one tile |
| `MOVEMENT.EASE_IN_TILES` | 2 | tiles to accelerate over at path start |
| `MOVEMENT.EASE_OUT_TILES` | 1 | tiles to decelerate over at path end |
| `MOVEMENT.MAX_PATH_LENGTH` | 25 | max queued tiles per click |

### Player Sync

The server maintains a 3-chunk interest area around each player. Three message types drive sync:

| Message | When | Contains |
|---|---|---|
| `player_init` | Player enters interest area | Full state: id, index, name, hp, maxHp, x, y |
| `tick` | Every 100 ms while in range | `{ t, p: [index, x, z, facing, hp][] }` |
| `player_leave` | Player exits interest area | `{ index }` |

Each player is assigned a small integer **session index** on init. Tick payloads use this index instead of the full UUID, keeping payloads minimal. The `indexRegistry` in the Zustand store maps `index → uuid`.

Tick behaviour:
- Server ticks every 100 ms
- Nothing is sent if nothing has changed (delta suppression via `ws.lastState`)
- A stationary player generates zero outbound tick traffic
- Combat and death events are sent immediately as discrete events, not batched

### World Architecture

```
World
└── Region      (named area — "Starting Zone", "Wilderness")
  └── Chunk     (16×16 tiles, loaded/unloaded as player moves)
    └── Tile    (single cell — type + height)
```

#### Tile

The smallest world unit. Identified by `(x, y, z)`. Tiles with `walkable: false` are impassable.

```ts
Tile {
  type: TileType   // GRASS | WATER | STONE | SAND | PATH
  y:    TileHeight // 0 | 0.25 | 0.5 | 0.75 | 1 | 2 | 3
}
```

`TileHeight` values: `GROUND (0)`, `SLOPE_LOW (0.25)`, `SLOPE_MID (0.5)`, `SLOPE_HIGH (0.75)`, `FIRST_FLOOR (1)`, `SECOND_FLOOR (2)`, `THIRD_FLOOR (3)`.

Tiles are stored in a map keyed by `"x,y,z"` — coordinates are the key, not stored inside the tile.

#### Chunk

A 16×16 block of tiles (256 tiles). Chunks are the unit of streaming. The client holds a 3×3 grid (9 chunks) around the player:

```ts
const chunkX = Math.floor(x / CHUNK_SIZE)   // CHUNK_SIZE = 16
const chunkZ = Math.floor(z / CHUNK_SIZE)
const localX = x % CHUNK_SIZE
const localZ = z % CHUNK_SIZE
```

When the player enters a new chunk, the 3 newly visible edge chunks are loaded and the 3 on the opposite edge are evicted. Chunks are cached in memory for the session — fetched once, never re-fetched.

Chunk data is **static world data served directly to the client**, not streamed through the game server. Currently, chunk data lives as static TypeScript files under `src/game-client/world/regions/`.

#### Region

A named area defined by a collection of chunks. Holds metadata: name, PvP rules, spawn points, ambient settings. A chunk always belongs to exactly one region.

```ts
Region {
  id:     string
  name:   string
  chunks: Record<string, Chunk>  // key: "chunkX,chunkZ"
  pvp:    boolean
}
```

#### World

The master registry of all regions. Holds no tile data directly — maps region IDs to Region definitions.

```ts
World {
  regions: Record<string, Region>  // key: region id
}
```

All game systems speak in world tile coordinates `(x, y, z)`. Chunk and region are always derived from coordinates, never stored on the player.

### Map Loading Strategy

World data loads in tiers to minimise initial load time:

1. **World map** — region metadata and chunk boundaries; no tile data yet
2. **Terrain** — tile data for nearby chunks, streamed as the player moves
3. **Objects / Interactables** — loaded for visible chunks only
4. **Entities (NPCs, players)** — last; terrain must exist before entities can path against it

### Skills

Players have skills (Combat, Woodcutting, Mining, Fishing). Each skill has an XP value and a derived level computed via the XP curve in `mmo-shared`. Performing world actions awards XP to the relevant skill.

### Combat

Tile-based. A player can attack another player or NPC if they are on an adjacent tile. Each attack/defend cycle runs on a fixed tick. HP depletes on hits. Death triggers a respawn at the region's spawn point.

### Inventory

Fixed-size item grid. Items can be picked up from world tiles or dropped onto them. Item quantities are tracked per slot.

### NPCs

NPCs have a fixed home position in world coordinates `(x, y, z)` defined outside chunk data. They have a mesh, a name label, and can be interacted with for dialogue or trade. NPC definitions are loaded as a separate layer after terrain.

### Quests

Quests have three states: not started, in progress, complete. Completion is tracked via a state machine. Completing a quest awards XP or items.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `kebab-case.ts` | `game-store.ts`, `chunk-manager.ts` |
| Components | `PascalCase.tsx` | `GameCanvas.tsx`, `LoginForm.tsx` |
| Classes | `PascalCase` | `GameEngine`, `PlayerManager` |
| Functions | `camelCase` | `initGame`, `snapToTile`, `connectWS` |
| Types / Interfaces | `PascalCase` | `Tile`, `PlayerState`, `ChunkData` |
| Constants | `UPPER_SNAKE_CASE` | `TILE_SIZE`, `CHUNK_SIZE` |
| WS message types | `snake_case` strings | `player_init`, `player_leave`, `tick` |
| Zustand actions | verb-prefixed `camelCase` | `setMyId`, `registerPlayer`, `applyTick` |

---

## Logging

All logging goes through `src/utils/logger.ts`. Raw `console.log` is **banned** everywhere in the codebase.

```ts
logger.log(...)    // general — dev only
logger.warn(...)   // warnings — dev only
logger.error(...)  // errors — always on
logger.ws(...)     // WebSocket events — dev only
logger.game(...)   // Babylon/game events — dev only
```

Logger output is gated by `NEXT_PUBLIC_DEV_MODE === "true"` (errors are always emitted).
