# mmo-client

Browser-based 3D MMO client. Players move around a tile-based world, interact with other players in real time, and progress through skills, combat, and quests. Built with Next.js, Babylon.js, and Zustand.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| 3D Engine | Babylon.js 9 |
| State | Zustand |
| Real-time | WebSocket (`ws-client.ts`) + SSE (`/api/builder/watch`) |
| HTTP | Axios wrapper (`http.ts`) |
| Shared types/logic | `mmo-shared` (protocol, skills, XP, items) |
| Language | TypeScript — strict throughout |

---

## Branch

Active development is on feature branches off `main`. All PRs target `main`.

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
| `NEXT_PUBLIC_DEV_MODE` | Set `true` to enable verbose logger output and dev auto-login |
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
│   ├── api/
│   │   ├── auth/login/         # Login API route
│   │   └── builder/
│   │       ├── chunk/          # GET + POST single chunk
│   │       ├── chunks/         # GET all chunks (batch)
│   │       ├── region/         # POST create region
│   │       ├── regions/        # GET all regions + coords
│   │       └── watch/          # GET SSE chunk-change stream
│   ├── game/                   # Game page
│   ├── login/                  # Login page
│   ├── map-builder/            # Map builder page (dev only)
│   └── layout.tsx
│
├── config/                     # Environment variable bindings (NEXT_PUBLIC_*)
│
├── game-client/                # All Babylon.js logic — no React inside here
│   ├── index.ts                # initGame / connectGame / destroyGame (async)
│   ├── engine.ts               # GameEngine — Babylon Engine + Scene
│   ├── camera.ts               # GameCamera — arc-rotate, player follow
│   ├── constants.ts            # WORLD, CAMERA, PLAYER, CHUNK_LOADING, MOVEMENT
│   ├── entities/
│   │   └── players.ts          # PlayerManager
│   ├── input/
│   │   ├── keys.ts
│   │   └── pointer.ts
│   ├── movement/
│   │   ├── index.ts
│   │   ├── animation.ts
│   │   ├── speed.ts
│   │   └── waypoints.ts
│   └── world/
│       ├── index.ts            # GameWorld — loadRegion, loadChunk, hasChunk, reloadChunk
│       ├── loader.ts           # loadAllRegions (AbortSignal), reloadChunkFromApi
│       ├── region.ts           # GameRegion — per-region chunk lifecycle
│       ├── chunk.ts            # Chunk — 16×16 tile mesh grid
│       ├── tile-config.ts
│       ├── tile-height.ts
│       └── regions/            # Chunk data files: <regionId>/<chunkX>_<chunkZ>.ts
│
├── presentation/
│   ├── 1-atoms/
│   ├── 2-molecules/
│   ├── 3-organisms/            # GameCanvas, LoginForm, MapBuilder
│   ├── 4-layouts/
│   └── 5-pages/
│
├── types/
│   ├── index.ts                # Barrel — re-exports all client-only types
│   └── mmo/
│       ├── builder.ts          # BuilderRegion, BuilderRegionsResponse, BuilderSaveRequest
│       ├── world.ts            # Region, ChunkData, Tile, TileType, TileHeight
│       ├── player.ts           # PlayerState, AnimationState (client render state)
│       ├── game-state.ts       # GameStoreState (Zustand store shape)
│       ├── entities.ts         # NPC, Interactable
│       ├── network.ts          # LoginPayload, RegisterPayload (HTTP auth forms)
│       ├── position.ts         # Position, ZERO_POSITION
│       ├── settings.ts         # UserSettings, CameraSettings, DEFAULT_SETTINGS
│       └── structure.ts        # Structure, WallFace, Floor, etc.
│
└── utils/
    ├── game-store.ts           # Zustand store — single store, no slices
    ├── ws-client.ts            # WebSocket singleton
    ├── xp.ts                   # Re-exports xpToLevel etc. from mmo-shared; maxHpFromSkills
    ├── settings.ts             # loadSettings / saveSettings / patchSettings (localStorage)
    ├── http.ts                 # Axios wrapper (httpClient + request<T>)
    ├── logger.ts               # Never use raw console.log
    ├── use-focus-zoom.ts       # Map builder viewport zoom/pan/focus hook
    ├── use-zoom.ts             # Standalone pinch/wheel zoom hook
    ├── chunk-spiral.ts         # Spiral coord generator for chunk streaming
    ├── builder-grid.ts
    ├── chunk-export.ts         # Generate chunk .ts file content
    ├── chunk-parse.ts          # Parse chunk .ts file back to tile data
    ├── region-index-gen.ts     # (legacy — kept for reference)
    ├── tile-colors.ts
    ├── response.ts
    ├── site.ts
    └── dev.ts
```

---

## Game Systems

### World Architecture

```
World
└── Region      (named area — "spawn", "wilderness")
  └── Chunk     (16×16 tiles)
    └── Tile    (single cell — type + height)
```

#### Tile

```ts
Tile {
  type: TileType   // GRASS | WATER | STONE | SAND | PATH
  y:    TileHeight // GROUND(0) | SLOPE_LOW(0.25) | SLOPE_MID(0.5) | SLOPE_HIGH(0.75)
                   // FIRST_FLOOR(1) | SECOND_FLOOR(2) | THIRD_FLOOR(3)
}
```

#### Chunk

A 16×16 block of tiles. Coordinates: `chunkX = Math.floor(x / 16)`, `chunkZ = Math.floor(z / 16)`.

Chunk files are named `<chunkX>_<chunkZ>.ts` using underscore as separator (avoids ambiguity with negative numbers).

#### Region

A named folder of chunk files. The folder name is the region ID. No `index.ts` — the API scans the folder directly.

### Chunk Loading

On game init, `loadAllRegions` in `loader.ts` fetches the region list from `GET /api/builder/regions`, then fetches each chunk's tile data in parallel via `GET /api/builder/chunk`. An `AbortController` signal is passed through every `fetch` call so React StrictMode's double-mount does not cause a double-fetch; `AbortError` is swallowed silently.

In future, chunks will stream outward from the player's spawn position (spiral pattern — `chunk-spiral.ts` is ready).

### Chunk Hot-Reload (Dev)

In dev, the game client holds an SSE connection to `/api/builder/watch`. When the map builder saves a chunk, the server pushes a `chunk_changed` event. The client re-fetches that chunk via `reloadChunkFromApi` and rebuilds its tile meshes without a page reload.

### Map Builder

Available at `/map-builder` in dev. Paint tiles, set heights, assign regions, save chunks. The world grid renders seamlessly with no gaps. Click any chunk to focus-zoom to it with surrounding context. Middle-click to pan. Scroll to zoom.

### Movement

Players move by clicking a tile. The click is snapped to tile centre and a `move` packet is sent. Remote players lerp to their updated position each render frame using the speed value at `PlayerDelta[5]`.

### Player Sync

All WS message types are defined in `mmo-shared/src/types/protocol.ts`.

| Message | When | Contains |
|---|---|---|
| `login_success` | On auth | `id`, `uuid`, `name`, `x/y/z`, `facing`, `sessionToken`, `sessionExpiresAt` |
| `player_join` | Player enters range | `PlayerPresence` — `{ id, name, x, y, z, facing }` |
| `player_leave` | Player exits range | `{ id }` |
| `tick` | Every 300ms | `{ t, p: [id, x, y, z, facing, pace][] }` |
| `player_stopped` | Move rejected | `{ id, x, y, z, facing }` — authoritative correction |

### Skills

Skill XP and level logic lives in `mmo-shared`. The client holds raw XP in `PlayerState.skills` (a `Skills` record keyed by `SkillId`) and derives levels via `xpToLevel` / `getSkillLevel` imported from `mmo-shared`. Never store derived level values.

The client-only `maxHpFromSkills(skills)` helper lives in `src/utils/xp.ts`:

```ts
xpToLevel(player.skills[0].xp, 0) * 10  // skill 0 = hitpoints
```

### Settings

`UserSettings` (defined in `src/types/mmo/settings.ts`) covers camera, controls, and any future user preferences. Settings are persisted to `localStorage` via `utils/settings.ts` and kept in sync with the Zustand store via `updateSettings`. On load, stored settings are merged with `DEFAULT_SETTINGS` so new keys are never missing.

### Combat

Tile-based. Attack if on adjacent tile. Fixed tick cycle. Death → respawn at region spawn point.

### Inventory

Fixed-size item grid. Pick up from / drop onto world tiles.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `kebab-case.ts` | `game-store.ts`, `use-focus-zoom.ts` |
| Components | `PascalCase.tsx` | `GameCanvas.tsx`, `MapBuilder.tsx` |
| Classes | `PascalCase` | `GameEngine`, `GameRegion` |
| Functions | `camelCase` | `initGame`, `loadChunk`, `focusChunk` |
| Types | `PascalCase` | `Tile`, `ChunkData`, `BuilderRegion` |
| Constants | `UPPER_SNAKE_CASE` | `CHUNK_SIZE`, `FOCUS_ZOOM` |
| WS message types | `snake_case` strings | `login_success`, `player_join`, `tick` |
| Zustand actions | verb-prefixed `camelCase` | `setMyId`, `registerPlayer`, `hydrateLocalPlayer` |

---

## Logging

All logging goes through `src/utils/logger.ts`. Raw `console.log` is **banned**.

```ts
logger.log(...)    // general — dev only
logger.warn(...)   // warnings — dev only
logger.error(...)  // errors — always on
logger.ws(...)     // WebSocket events — dev only
logger.game(...)   // Babylon/game events — dev only
```
