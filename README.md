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
The world is made up of regions, each containing chunks of 128x128 tiles. Chunks are loaded and unloaded dynamically as the player moves. Tiles can be marked as unwalkable to represent obstacles, walls, or water.

### Skills
Players have a set of skills (e.g. Combat, Woodcutting, Mining, Fishing). Each skill has an XP value and a derived level. Performing actions in the world awards XP to the relevant skill.

### Combat
Combat is tile-based. A player can attack another player or NPC if they are within melee range (adjacent tile). Each attack/defend cycle runs on a fixed tick. Players have health which depletes on hits. Death triggers a respawn at a defined region spawn point.

### Inventory
Players carry items in a fixed-size inventory grid. Items can be picked up from world tiles or dropped onto them. Item quantities are tracked per slot.

### NPCs
NPCs are spawned at fixed points within regions. They have a mesh, a name label, and can be interacted with for dialogue or trade.

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
The smallest unit of the world. A tile is identified by its coordinates `x, y, z`. Tiles marked `walkable: false` contain a static impassable object such as a wall, rock, or water. Players and NPCs can occupy the same walkable tile simultaneously.

```ts
Tile {
  walkable: boolean
}
```

Tiles are stored in a map keyed by `"x,y,z"` — coordinates are the key, not stored inside the tile.

### Chunk

A 16x16 block of tiles (256 tiles total). Chunks are the unit of streaming — only chunks near the player are held in memory at any time. The server loads a 3x3 grid of chunks around the player and streams new ones in as they move, unloading chunks that fall out of range.

```ts
Chunk {
  chunkX: number
  chunkY: number
  chunkZ: number
  tiles: Record<string, Tile>  // key: "x,y,z" local to chunk
}
```

Each chunk has a position in the world expressed as chunkX, chunkY, chunkZ. The chunk a player occupies is derived directly from their tile coordinates:

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

## Coordinate System

All positions use tile coordinates x, y, z.

- `x` and `z` define position on the horizontal plane
- `y` defines the vertical layer (0 = ground level, 1 = first floor, -1 = underground etc.)
- A tile is 1 unit. `TILE_SIZE` (the visual size in the 3D world) lives only in `tiles.ts`
- A chunk is 16x16 tiles on the x/z plane — y layers are defined per tile
- `snapToTile(x, y, z)` is the single source of truth for converting a world position to a tile coordinate
- The server, store, and all types speak in tile coordinates — only the renderer cares about `TILE_SIZE`

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
│ ├── api/              # login, register API routes
│ ├── login/            # login page
│ └── game/             # game page
├── game-client/    
│ ├── index.ts          # singleton init/destroy
│ ├── engine.ts         # Engine + Scene
│ ├── camera.ts         # camera
│ ├── world.ts          # ground, lighting
│ ├── grid.ts           # tile grid overlay
│ ├── players.ts        # player meshes
│ └── tiles.ts          # snapToTile, TILE_SIZE, CHUNK_SIZE
├── presentation/   
│ ├── 1-atoms/          # buttons, inputs
│ ├── 2-molecules/      # form fields, UI groups
│ ├── 3-organisms/      # GameCanvas, LoginForm
│ ├── 4-layouts/        # BaseLayout
│ └── 5-pages/          # GamePage, LoginPage 
├── types/    
│ └── mmo/    
│   ├── tile.ts   
│   ├── chunk.ts    
│   ├── region.ts   
│   ├── player.ts   
│   ├── network.ts    
│   └── game-state.ts   
└── utils/    
├── game-store.ts       # Zustand store
├── ws-client.ts        # WebSocket connection
├── http.ts             # Axios wrapper
└── response.ts         # API response helpers
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
