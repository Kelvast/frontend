# MMO-Client Context & Documentation

> **For AI context only.** Reflects current implementation reality, not aspirations.  
> **Last updated:** 2026-03-24  
> **Active branch:** doc-update-march-24-v2

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
│       ├── world.ts                # TileType, TileHeight, TILE_WALKABLE, Tile, tile(), ChunkData, ...
│       ├── player.ts               # PlayerStats, PlayerState
│       ├── position.ts             # Position, Rotation
│       ├── network.ts              # WSMessage union, PlayerInitMsg, TickMsg, PlayerDelta
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
| `game-client/world/regions/spawn/chunk-1.ts` | ✅ Built |
| `utils/game-store.ts` — Zustand store | ✅ Built |
| `utils/ws-client.ts` — WebSocket client | ✅ Built |
| `types/mmo/world.ts` — all world types | ✅ Built |
| `types/mmo/player.ts` — PlayerState | ✅ Built |
| `types/mmo/network.ts` — WSMessage | ✅ Built |
| `game-client/entities/npcs.ts` | ⬜ Empty placeholder |
| Chunk manager (load/unload on movement) | ⬜ Not yet built |


***

## Locked Decisions

- **Chunks are terrain only** — no NPCs, no spawn points, no interactables in `ChunkData`.
- **NPCs will have their own type** with a fixed home position `(x, y, z)` in world coords.
- **Spawn points are external** — coordinates passed at runtime, not baked into map.
- **All systems speak world coords `(x, y, z)`** — chunk/region always derived.
- **Chunks are static and cacheable** — fetched once per session.
- **Chunk loading is client-driven** — client fetches tile data directly.
- **WASD moves camera only**, never the player.
- **Documentation Workflow** — Managed in repeatable atomic units. All documentation updates are performed on dedicated branches followed by a PR. AI assistants are strictly prohibited from merging their own PRs; manual review is required for all changes.
- **AI-Managed PR Policy** — The AI must never merge a PR it has created. All merges are the responsibility of the human user.
- **Security Architecture** — XOR + HMAC-2B (truncated SHA-256) chosen for the fastest performance (3,343ns) and minimal overhead.

***

## Network Protocol Findings (2026-03-22)

**Status**: Finalized for `mmo-shared` package implementation.
**Wire Format**: `Uint16Array(4)` (8 bytes) + 4-byte HMAC signature = **12 bytes total**.


| r | Message | Direction | Description |
| :-- | :-- | :-- | :-- |
| **0** | `action_start` | Inbound | Begin gather/action (anim sync) |
| **1** | `action_finish` | Inbound | Complete action (server-side roll) |
| **10** | `tick` | Outbound | Nearby player delta positions |
| **12** | `move` | Inbound | Click-to-move target tile |


***

## Pending / Not Yet Built

- [ ] **Implement `mmo-shared` package** — Create a unified protocol layer and shared registries.
- [ ] **Integrate Binary Wire Protocol** — Replace JSON-based messages with the 12-byte XOR + HMAC-2B encrypted packets.
- [ ] **Update `network.ts` and `ws-client.ts`** — Transition to the new shared protocol types.
- [ ] **Wire `nearbyPlayers` from store** into Babylon `PlayerManager` so meshes spawn/move.
- [ ] **Chunk manager** — Implement load/unload/cache logic around player movement.
- [ ] **NPC Implementation** — registry and `npcs.ts` functionality.
- [ ] **Core Systems** — Skills, Combat, Inventory, and Quest systems.

***

## Migration Path

1. **Phase 1 (Immediate)**: Create `mmo-shared`, move constants/registries, and implement identical encrypt/decrypt functions in both repos.
2. **Phase 2 (Stability)**: Add server-side location tracking for cheat detection and rotation of nonces.

