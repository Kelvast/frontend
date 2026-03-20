> For AI context only. Reflects current implementation reality, not aspirations.
> Last updated: 2026-03-20
> Active branch: nextjs-zustand

---

## Project

Browser-based 3D MMO client. Next.js (App Router) + Babylon.js + Zustand.
Server is a separate repo (`mmo-server`).

---

## Current Stack

- **Next.js** (App Router) — routing, login/register API routes, SSR shell
- **Babylon.js** — 3D rendering, scene, input
- **Zustand** — client game state (`src/utils/game-store.ts`)
- **TypeScript** — strict throughout
- **Tailwind CSS** — styling
- **WebSockets** — real-time server connection (`src/utils/ws-client.ts`)
- **Axios** — HTTP wrapper (`src/utils/http.ts`)

---

## Folder Structure (actual)

```

src/
├── app/
│   ├── api/              \# Next.js API routes (login, register)
│   ├── game/             \# Game page
│   ├── login/            \# Login page
│   ├── layout.tsx        \# Root layout
│   ├── page.ts           \# Root redirect
│   ├── error.ts
│   └── not-found.ts
├── game-client/
│   ├── index.ts          \# initGame / connectGame / destroyGame singleton
│   ├── engine.ts         \# GameEngine class (Babylon Engine + Scene)
│   ├── camera.ts         \# GameCamera class (arc rotate, WASD camera only)
│   ├── input.ts          \# Click → snapToTile → sendPlayerUpdate
│   ├── constants.ts      \# TILE_SIZE, CHUNK_SIZE, camera constants
│   ├── entities/
│   │   ├── players.ts    \# PlayerManager class — local + remote player meshes
│   │   └── npcs.ts       \# Empty placeholder — not yet implemented
│   └── world/
│       ├── index.ts      \# GameWorld class
│       ├── chunk.ts      \# Chunk class — spawns/disposes tile meshes from ChunkData
│       ├── tile-config.ts \# TILE_CONFIG — color + walkable per TileType
│       └── regions/
│           └── spawn/
│               └── chunk-1.ts  \# First hand-authored ChunkData (16×16 tile grid)
├── presentation/
│   ├── 1-atoms/
│   ├── 2-molecules/
│   ├── 3-organisms/      \# GameCanvas, LoginForm
│   ├── 4-layouts/
│   └── 5-pages/
├── types/
│   ├── index.ts          \# Re-exports all mmo types
│   └── mmo/
│       ├── world.ts      \# TileType, TileHeight, TILE_WALKABLE, Tile, tile(), ChunkData, Region, World
│       ├── player.ts     \# PlayerStats, PlayerState
│       ├── position.ts   \# Position, Rotation
│       ├── network.ts    \# WSMessage union, AuthResponse
│       ├── game-state.ts \# GameStoreState
│       └── entities.ts   \# (stub)
├── utils/
│   ├── game-store.ts     \# Zustand store — myId, player, nearbyPlayers, isConnected, latency
│   ├── ws-client.ts      \# WebSocket connection + message handling
│   ├── http.ts           \# Axios wrapper
│   ├── response.ts       \# API response helpers
│   └── site.ts           \# Site metadata / config helpers
└── config/               \# App-level config

```

---

## What Is Actually Built

| File | Status |
|---|---|
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
| `types/mmo/network.ts` — WSMessage | ✅ Built |
| `game-client/entities/npcs.ts` | ⬜ Empty placeholder |
| Chunk manager (load/unload on movement) | ⬜ Not yet built |
| Delta compression / session index network protocol | ⬜ Not yet built |
| Skills, combat, inventory, quests | ⬜ Not yet built |

---

## World Types (current, from `src/types/mmo/world.ts`)

```ts
enum TileType { GRASS | WATER | STONE | SAND | PATH }

const TileHeight = { GROUND: 0, SLOPE_LOW: 0.25, SLOPE_MID: 0.5, SLOPE_HIGH: 0.75,
                     FIRST_FLOOR: 1, SECOND_FLOOR: 2, THIRD_FLOOR: 3 } as const
type TileHeight = typeof TileHeight[keyof typeof TileHeight]

interface Tile {
  type: TileType
  y: TileHeight
}

const tile = (type: TileType, y: TileHeight = TileHeight.GROUND): Tile => ({ type, y })

interface ChunkData {
  chunkX: number
  chunkZ: number
  region: string
  tiles: Tile[][]  // 16×16
}

interface Region {
  id: string
  name: string
  pvp: boolean
  spawnPoint: { x: number; z: number }  // NOTE: under review — may move external
  chunks: Record<string, ChunkData>     // key: "chunkX,chunkZ"
}

interface World {
  regions: Record<string, Region>       // key: region id
}
```


---

## Zustand Store (current, from `src/utils/game-store.ts`)

```ts
{
  myId: string | null
  player: PlayerState | null
  nearbyPlayers: PlayerState[]
  worldTime: number
  isConnected: boolean
  latency: number

  // actions
  setMyId, updatePlayer, setNearbyPlayers,
  addNearbyPlayer, removeNearbyPlayer,
  setConnected, setLatency
}
```


---

## Network Protocol (current, from `src/types/mmo/network.ts`)

```ts
type WSMessage =
  | { type: 'init'; myId: string; players: PlayerState[] }
  | { type: 'player_update'; playerId: string; position: Position; rotation?: any }
  | { type: 'player_join'; player: PlayerState }
  | { type: 'player_leave'; playerId: string }
  | { type: 'ping'; latency: number }
```

> Delta compression and session index are designed but not yet implemented.

---

## Locked Decisions

- **Chunks are terrain only** — no NPCs, no spawn points, no interactables in `ChunkData`
- **NPCs will have their own type** with a fixed home position `(x, y, z)` in world coords, defined externally, not inside chunks
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
- **Session index** — designed: on init each nearby player gets small integer index, delta packets use index not UUID

---

## Coordinate System

- World tile coords: `x, z` (integer), `y` = `TileHeight`
- Chunk from tile: `chunkX = Math.floor(x / CHUNK_SIZE)` — `CHUNK_SIZE = 16`
- Local tile in chunk: `localX = x % CHUNK_SIZE`
- World pixel pos: `worldX = (chunkX * CHUNK_SIZE + localX) * TILE_SIZE` — `TILE_SIZE = 32`

---

## Pending / Not Yet Built

- [ ] Chunk manager — load/unload/cache chunks around player on movement
- [ ] `TileHeight` — sloped and multi-floor terrain rendering
- [ ] Region system wired up client-side
- [ ] NPC type, registry, and `npcs.ts` implementation
- [ ] Delta compression + session index network protocol
- [ ] Skills system
- [ ] Combat system
- [ ] Inventory system
- [ ] Quest system
- [ ] Interactables registry

---

## Naming Conventions

- Files: `kebab-case.ts` / `PascalCase.tsx` for components
- Classes: `PascalCase` (`GameEngine`, `PlayerManager`)
- Functions: `camelCase` (`initGame`, `snapToTile`, `connectWS`)
- Types/Interfaces: `PascalCase` (`Tile`, `PlayerState`, `WSMessage`)
- Constants: `UPPER_SNAKE_CASE` (`TILE_SIZE`, `CHUNK_SIZE`, `TILE_CONFIG`)
- WS message types: `snake_case` strings (`player_move`, `player_join`)
- Zustand actions: `camelCase` prefixed with verb (`setMyId`, `addNearbyPlayer`)

