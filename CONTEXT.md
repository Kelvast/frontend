# MMO-Client Context & Documentation

> **For AI context only.** Reflects current implementation reality, not aspirations.  
> **Last updated:** 2026-03-24  
> **Active branch:** doc-update-march-24-v2

***

## Project Overview
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
- **mmo-shared** — (Pending) Shared package for protocol, registries, and crypto.

***

## Folder Structure (Actual)
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
│       ├── network.ts              # WSMessage union — (Migrating to Binary Protocol)
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
| `game-client/world/regions/spawn/chunk-1.ts` | ✅ Built (hand-authored data) |
| `utils/game-store.ts` — Zustand store | ✅ Built |
| `utils/ws-client.ts` — WebSocket client | ✅ Built |
| `types/mmo/world.ts` — all world types | ✅ Built |
| `types/mmo/player.ts` — PlayerState | ✅ Built |
| `types/mmo/network.ts` — Legacy JSON protocol | ✅ Built (Phasing out) |
| `game-client/entities/npcs.ts` | ⬜ Empty placeholder |
| Chunk manager (load/unload on movement) | ⬜ Not yet built |
| Binary Wire Protocol (XOR + HMAC-2B) | ⬜ Pending Migration |
| `mmo-shared` Package | ⬜ Pending Creation |


***

## Locked Decisions \& Meta-Policies

- **Documentation Workflow**: Documentation is managed in repeatable atomic units. All documentation updates are performed on dedicated branches followed by a PR.
- **AI-Managed PR Policy**: AI assistants are strictly prohibited from merging their own PRs. All merges are the responsibility of the human repo owner after manual review.
- **Chunks are terrain only**: No NPCs, spawn points, or interactables in `ChunkData`.
- **NPCs**: Fixed home positions `(x, y, z)` defined externally, loaded as a layer after terrain.
- **Security**: XOR + HMAC-2B (truncated SHA-256) is the standard for game packets.
- **Wire Format**: Fixed 12-byte packets (`Uint16Array(4)` payload + 4-byte signature).
- **Coordinate System**: All systems speak world coords `(x, y, z)`. Chunk/Region always derived.
- **WASD**: Moves camera only, never the player.
- **Server Authority**: Server is the sole authority on game state; client is display-only.

***

## Network Protocol Findings (2026-03-24)

**Status**: Finalized for `mmo-shared` package implementation.

### Binary Wire Format (v1.0)

`[encrypted_8b] + [hmac_2b_sig] = 12 bytes total`

**Payload Structure `[r, s, t, id]`**:


| Component | Range | Description |
| :-- | :-- | :-- |
| `r` (Request) | 0-15 | Type (e.g., `0`=action_start, `12`=move, `10`=tick) |
| `s` (Skill) | 0-31 | Skill ID per `SKILL_REGISTRY` |
| `t` (Target) | 0-255 | Resource type / amount / context |
| `id` (Entity) | 0-65535 | Encoded Tile or Entity ID |

### Security Architecture

1. **Key Exchange**: Client connects → Server generates unique 32-byte `sessionKey` (sent via TLS).
2. **XOR Encryption**: Blinds the 8-byte payload using the session key.
3. **HMAC-2B Integrity**: Truncated SHA-256 signature to prevent tampering.
4. **Nonce Replay Protection**: Nonce increments per message; server rejects stale nonces.

***

## [LEGACY] JSON Protocol (Phasing Out)

*These interfaces remain in `src/types/mmo/network.ts` until the binary migration is complete.*

```ts
// Server → Client
interface PlayerInitMsg { type: "player_init"; index: number; id: string; name: string; hp: number; maxHp: number; x: number; y: number }
type PlayerDelta = [index: number, x: number, y: number, facing: number, hp: number]
interface TickMsg { type: "tick"; t: number; p: PlayerDelta[] }

// Client → Server
interface LoginPacket { type: "login"; email: string; pass: string }
interface ClickPacket { type: "click"; targetX: number; targetY: number }
```


***

## World \& Coordinate Systems

- **Chunk Size**: 16x16 tiles.
- **Tile Size**: 32 units.
- **Chunk Derivation**: `chunkX = Math.floor(x / 16)`.
- **Pixel Calculation**: `worldX = (chunkX * 16 + localX) * 32`.
- **Loading Order**: 1. World Map → 2. Terrain → 3. Objects → 4. Entities.

***

## Pending Tasks / TODOs

- [ ] **Create `mmo-shared` package**: Centralize protocol, registries, and crypto.
- [ ] **Implement Binary Migration**: Update `ws-client.ts` to handle 12-byte `ArrayBuffer` payloads.
- [ ] **Wire `nearbyPlayers` mesh sync**: Connect store to Babylon `PlayerManager`.
- [ ] **Chunk Manager**: Implement dynamic load/unload/cache logic.
- [ ] **`TileHeight` Rendering**: Support sloped and multi-floor terrain.
- [ ] **Core Game Systems**: Skills, Combat, Inventory, Quests, and Interactables.

***

## Scaling \& Cost Analysis (500 DAU Target)

- **Mean processing**: 3,343ns (XOR + HMAC-2B is the fastest valid option).
- **Network Traffic**: ~72 msgs/min per player.
- **Monthly Bandwidth**: ~0.061 GB.
- **Monthly Infrastructure Cost**: ~\$0.61 (Data transfer post-free tier).
