> For AI context only. Reflects current implementation reality, not aspirations. 
> Last updated: 2026-03-24 (Post-Protocol Finalization)
> Active branch: main

# Project Overview

Browser-based 3D MMO client built with **Next.js (App Router)**, **Babylon.js**, and **Zustand**. The project follows a strict authoritative server model where the client is primarily for rendering and local optimistic validation.

## Technical Stack

*   **Next.js (App Router)**: Handles routing, authentication API routes (login/register), and the SSR shell.
*   **Babylon.js**: Core 3D engine managing the scene, rendering loop, and user input.
*   **Zustand**: Manages client-side game state (`src/utils/game-store.ts`).
*   **TypeScript**: Strict typing across the entire codebase.
*   **WebSockets**: Real-time bidirectional communication via `src/utils/ws-client.ts`.

---

## Network Protocol & Security (Finalized 2026-03-24)

The network protocol is designed for high-frequency updates with minimal overhead.

### 1. Wire Format: Binary 8-Byte Tuples
All world actions use a unified 4-tuple shape encoded as a `Uint16Array(4)`:
`[r, s, t, id]`
*   **r**: Request type (0-15)
*   **s**: Skill ID (0-31)
*   **t**: Resource type / amount / context (0-255)
*   **id**: Entity / Tile / Player ID

### 2. Security Architecture: XOR + HMAC-2B
Messages are secured using a per-session XOR encryption with HMAC-2B tamper-proofing for the fastest possible processing with minimal latency overhead.
*   **Total Packet Size**: 12 bytes (8B encrypted payload + 4B HMAC-2B signature).
*   **Anti-Cheat**: Server-side authoritative validation for all outcomes, range checking, and cooldown anti-spam.

### 3. Message Registry (Summary)
| r | Direction | Message | Description |
|---|---|---|---|
| 0 | Inbound | `action_start` | Begin gather/action |
| 1 | Inbound | `action_finish` | Complete action (server rolls) |
| 10| Outbound | `tick` | Nearby player delta positions |
| 12| Inbound | `move` | Click-to-move target tile |

---

## World Architecture

### Coordinate System
*   **World Tiles**: Integer coordinates `(x, z)`. Height `y` derived from `TileHeight`.
*   **Chunks**: 16×16 tile blocks. `chunkX = Math.floor(x / 16)`.
*   **World Pixels**: `(chunkX * 16 + localX) * 32` (where `TILE_SIZE = 32`).

### Loading Strategy (Tiered)
1.  **World Map**: Region metadata and boundaries.
2.  **Terrain**: Chunk-based tile data, fetched via client-side LRU cache.
3.  **Objects**: Static interactables in visible chunks.
4.  **Entities**: Dynamic players and NPCs (interpolated).

---

## Folder Structure (actual)

```bash
src/
├── app/
│   ├── api/              # Next.js API routes (login, register)
│   ├── game/             # Game page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   └── page.ts           # Root redirect
├── game-client/
│   ├── index.ts          # initGame / connectGame singleton
│   ├── engine.ts         # GameEngine class (Babylon Engine + Scene)
│   ├── camera.ts         # GameCamera class
│   ├── world/            # GameWorld, Chunk, Tile management
│   └── entities/         # PlayerManager (local + remote)
├── types/
│   └── mmo/              # Canonical protocol & world contracts
└── utils/
    ├── game-store.ts     # Zustand store
    └── ws-client.ts      # WebSocket connection & binary handling
```

## Status: What Is Built
| Feature | Status |
|---|---|
| Next.js Shell & Auth | ✅ Built |
| Babylon.js Engine & Input | ✅ Built |
| Binary Protocol (Shared) | ✅ Finalized |
| `PlayerManager` | ✅ Built |
| Chunk Manager (LRU) | ⬜ Pending |
| NPC Registry | ⬜ Placeholder |
