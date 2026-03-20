# MMO Client

## Overview

A browser-based 3D MMO. Players move around a tile-based world, interact with other players in real time, and progress through skills, combat, and quests.

---

## Game Systems

### Movement
Players move by clicking a tile on the ground. The client snaps the click to the nearest tile centre using `snapToTile` and sends the new position to the server. The server validates the move and broadcasts it to nearby players. Remote players interpolate smoothly to their new position. WASD moves the camera only, not the player.

### Player Sync

The server maintains an interest area of 3 chunks around each player. Only players within that radius are ever sent to a client — players outside it do not exist to that client.

#### Two Message Types

**Init** — sent once when a player enters your interest area. Contains full state.

**Delta** — sent every tick while they remain in range. Contains only what changed.

**Leave** — sent once when a player exits your interest area.

#### Session Index

On init, each player in range is assigned a small integer index for that session. All delta updates reference this index instead of the full ID — keeping tick payloads as small as possible.

```ts
// INIT — sent once
{ type: 'player_init', id: '74m48m4...', index: 4, name: 'User', hp: 100 }

// DELTA — sent every tick (index = 1 byte vs 36 byte UUID)
{ t: 1234, p: [[4, 10, 15, 1, 98], [7, 22, 8, 0, 100]] }

// LEAVE — sent once
{ type: 'player_leave', index: 4 }
```
#### Tick Behaviour

Server ticks every 100ms

Nothing is sent if nothing has changed

A player standing still generates zero outbound traffic

Combat actions and death events are sent immediately as events, not batched

### Players
Every player occupies exactly one tile at all times. The local player is always spawned at the world origin on load. Remote players are synced via the Zustand store, which is updated by incoming WebSocket messages.

### World
The world is made up of regions, each containing chunks of 16x16 tiles. Chunks are loaded and unloaded dynamically as the player moves. Tiles can be marked as unwalkable to represent obstacles, walls, or water.

### Skills
Players have a set of skills (e.g. Combat, Woodcutting, Mining, Fishing). Each skill has an XP value and a derived level. Performing actions in the world awards XP to the relevant skill.

### Combat
Combat is tile-based. A player can attack another player or NPC if they are within melee range (adjacent tile). Each attack/defend cycle runs on a fixed tick. Players have health which depletes on hits. Death triggers a respawn at a defined region spawn point.

### Inventory
Players carry items in a fixed-size inventory grid. Items can be picked up from world tiles or dropped onto them. Item quantities are tracked per slot.

### NPCs
NPCs have a fixed home position in world coordinates `(x, y, z)` — defined once, outside of chunk data. They have a mesh, a name label, and can be interacted with for dialogue or trade. NPC definitions are loaded as a separate layer after terrain, so the world is always ready before any entity needs to path against it.

### Quests
Quests have three states: not started, in progress, and complete. Completion is tracked via a state machine. Completing a quest awards XP or items.

---

## World Architecture

```ts
World
└── Region      (named area e.g. "Starting Zone", "Wilderness")
  └── Chunk     (16x16 tiles, loaded/unloaded as player moves)
    └── Tile    (single cell - walkable: boolean)
```

### Tile
The smallest unit of the world. A tile is identified by its coordinates `x, y, z`. Tiles marked `walkable: false` are impassable — water, walls, rocks etc. Players and NPCs can occupy the same walkable tile simultaneously.

Tiles are stored in a map keyed by `"x,y,z"` — coordinates are the key, not stored inside the tile.

Each tile has a type and a height (`y`):

\```ts
Tile {
  type: TileType  // GRASS | WATER | STONE | SAND | PATH
  y: TileHeight   // 0 | 0.25 | 0.5 | 0.75 | 1 | 2 | 3
}
\```

`TileHeight` values: `GROUND (0)`, `SLOPE_LOW (0.25)`, `SLOPE_MID (0.5)`, `SLOPE_HIGH (0.75)`, `FIRST_FLOOR (1)`, `SECOND_FLOOR (2)`, `THIRD_FLOOR (3)`

### Chunk

A 16x16 block of tiles (256 tiles total). Chunks are the unit of streaming — only chunks near the player are held in memory at any time. The server loads a 3x3 grid of chunks around the player and streams new ones in as they move, unloading chunks that fall out of range.

```ts
Chunk {
  chunkX: number
  chunkZ: number
  region: string
  tiles: Tile[][]
}
```

Chunks are static terrain data served directly to the client, not through the game server. The client calculates which chunks are in range on movement and fetches any not already cached. Chunks are cached for the entire session — fetched once, never re-fetched. When the player moves into a new chunk, the newly visible edge chunks are loaded and the opposite edge is evicted.

```ts
const chunkX = Math.floor(x / CHUNK_SIZE)  // CHUNK_SIZE = 16
const chunkZ = Math.floor(z / CHUNK_SIZE)
```
The local tile position within that chunk is:

```ts
const localX = x % CHUNK_SIZE
const localZ = z % CHUNK_SIZE
```

Chunks stitch together implicitly through their coordinates — there are no explicit borders. The world is a continuous infinite grid of chunks.

#### Chunk Loading

Chunks are static world data served directly to the client — not streamed through the game server. When a player moves, the client calculates which chunks should be in range and fetches any it doesn't already have cached. The game server only tracks which chunk each player is currently in, not the tile data itself.

The client loads a 3x3 grid of chunks around the player (9 chunks, 2,304 tiles). Chunks are cached in memory for the session and only fetched once. When the player moves into a new chunk, the three new chunks on that edge are fetched and the three on the opposite edge are dropped from memory.

### Region

A named area of the world defined by a collection of chunks. Regions are an overlay on top of the chunk grid — they define metadata such as name, PvP rules, spawn points, and ambient settings. A chunk always belongs to exactly one region.

```ts
Region {
  id: string
  name: string
  chunks: Record<string, Chunk>  // key: "chunkX,chunkY,chunkZ"
  pvp: boolean
}
```

### World
The world is the master registry of all regions. It holds no tile data directly — it simply maps region ids to their Region definitions.

```ts
World {
  regions: Record<string, Region>  // key: region id
}
```

All game systems — the server, client, and store — speak in world tile coordinates x, y, z. The chunk and region are always derived from those coordinates, never stored on the player or entity directly.

---

## Map System

The world is divided into a grid of **chunks**, each `CHUNK_SIZE × CHUNK_SIZE` tiles. Only chunks near the player are loaded at any time.

World (infinite grid of chunks)
└── Chunk (16×16 tiles)
└── Tile (1×1 unit — has a type: grass, water, stone, sand, path)

text

### Coordinate System

Each tile has a world tile coordinate `(tx, tz)`. To find which chunk it belongs to:

- `chunkX = Math.floor(tx / CHUNK_SIZE)`
- `chunkZ = Math.floor(tz / CHUNK_SIZE)`

Local position within that chunk:

- `localX = tx % CHUNK_SIZE`
- `localZ = tz % CHUNK_SIZE`

### Loading Strategy

World data loads in tiers to minimise initial load time:

1. **World map** — region metadata and chunk boundaries, no tile data yet
2. **Terrain** — tile data for chunks near the player, streamed as they move
3. **Objects / Interactables** — loaded for visible chunks only
4. **Entities (NPCs, players)** — last, terrain must exist before entities path against it

Each layer is cached independently. The world map is nearly static and cached aggressively. Terrain chunks are cached for the session. Entities are always live.

### Tile Types

- `GRASS` — default terrain
- `WATER` — impassable
- `STONE` — walkable hard surface
- `SAND` — walkable soft surface
- `PATH` — walkable road/trail

### Files

- `src/game-client/constants.ts` — `TILE_SIZE`, `CHUNK_SIZE`
- `src/game-client/chunks.ts` — `Chunk` class, spawns and disposes tile meshes
- `src/game-client/chunk-manager.ts` — tracks loaded chunks, triggers load/unload on player movement
- `src/types/mmo/tile.ts` — `TileType` enum
- `src/types/mmo/chunk.ts` — `ChunkData` type (16×16 tile array + chunk coords)

---

## Tech Stack

- **Next.js** — UI, routing, login/register API routes
- **Babylon.js** — 3D game engine, rendering, input
- **Zustand** — lightweight client game state
- **WebSockets** — real time multiplayer sync
- **TypeScript** — strict typing throughout

---

## Folder Structure

```
src/
├── app/
│ ├── api/                # login, register API routes
│ ├── login/              # login page
│ └── game/               # game page
├── game-client/      
│ ├── index.ts            # singleton init/destroy
│ ├── engine.ts           # Engine + Scene
│ ├── camera.ts           # camera
│ ├── constants.ts        # TILE_SIZE, CHUNK_SIZE, camera constants
│ ├── world.ts            # ground, lighting
│ ├── grid.ts             # tile grid overlay
│ ├── players.ts          # player meshes
│ ├── chunks.ts           # Chunk class, tile mesh spawning
│ └── chunk-manager.ts    # load/unload chunks around player
├── presentation/     
│ ├── 1-atoms/            # buttons, inputs
│ ├── 2-molecules/        # form fields, UI groups
│ ├── 3-organisms/        # GameCanvas, LoginForm
│ ├── 4-layouts/          # BaseLayout
│ └── 5-pages/            # GamePage, LoginPage 
├── types/      
│ └── mmo/      
│   ├── tile.ts     
│   ├── chunk.ts      
│   ├── region.ts     
│   ├── player.ts     
│   ├── network.ts      
│   └── game-state.ts     
└── utils/      
├── game-store.ts         # Zustand store
├── ws-client.ts          # WebSocket connection
├── http.ts               # Axios wrapper
└── response.ts           # API response helpers
```

## Naming Conventions

- Files: `kebab-case.ts` / `PascalCase.tsx` for components
- Classes: `PascalCase` (e.g. `GameEngine`, `PlayerManager`)
- Functions: `camelCase` (e.g. `initGame`, `snapToTile`, `connectWS`)
- Types/Interfaces: `PascalCase` (e.g. `Tile`, `PlayerState`, `WSMessage`)
- Constants: `UPPER_SNAKE_CASE` (e.g. `TILE_SIZE`, `CHUNK_SIZE`)
- WS message types: `snake_case` strings (e.g. `player_move`, `player_join`)
- Zustand actions: `camelCase` prefixed with verb (e.g. `setMyId`, `addNearbyPlayer`)

---

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run format   # prettier format
```
