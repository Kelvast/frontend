> For AI context only. Reflects current implementation reality.
> Last updated: 2026-03-24
> Active branch: docs-rewrite

***

## Project Overview

A browser-based 3D MMO client built with **Next.js (App Router)**, **Babylon.js**, and **Zustand**. The project follows an optimistic client / authoritative server model. The server is a separate repository (`mmo-server`), written in Node.js/TypeScript and deployed via SST v3 to AWS.

## Core Architecture

### Unified Wire Protocol
All world actions use a fixed-length numeric 4-tuple, optimized for binary transmission over WebSockets:
`[r, s, t, id]`

- **r (Request Type)**: 0-15 (e.g., action_start, action_finish, move, spawn)
- **s (Skill/System ID)**: 0-31 (e.g., woodcutting, mining)
- **t (Type/Amount)**: 0-255 (e.g., oak_tree, willow_tree)
- **id (Entity/Tile ID)**: World-unique identifier

**Encoding**: `Uint16Array(4)` resulting in an 8-byte payload per message.

### Security Stack (XOR + HMAC-2B)
To balance speed and tamper-resistance:
- **XOR Encryption**: Obfuscates the 8-byte payload using a per-session key.
- **HMAC-2B**: A truncated 2-byte SHA-256 signature appended to the message.
- **Total Wire Size**: 12 bytes.
- **Replay Protection**: Nonce sequencing ensures messages cannot be re-sent.

### Authoritative Server Model
- **Client**: Optimistic UI, local pathfinding, animation sync, and range validation.
- **Server**: Performs success rolls, derived XP awarding (never trusts client-sent values), and broadcasts state changes to nearby players.
- **Shared Registry**: A unified `mmo-shared` package (upcoming) will house all Skill, Resource, and Request registries to prevent logic drift.

## Game Systems

### World & Chunks
- **Infinite Grid**: The world is composed of 16x16 tile **Chunks**.
- **Dynamic Loading**: Client fetches a 3x3 grid of chunks around the player.
- **Tiles**: Each tile has a `type` (GRASS, WATER, etc.) and a `height` (y-axis).
- **Regions**: Named areas (e.g., "Starting Zone") that group chunks and define rules (PvP, Spawn).

### Entity Sync
- **Interest Area**: Server only streams data for entities within 3 chunks of the player.
- **Session Index**: On init, players are assigned a 1-byte index for that session to keep delta updates small.
- **Tick Rate**: Server ticks every 100ms for positional sync; events (combat/death) are sent immediately.

### Skills & Gathering
- **Action Flow**: `action_start` (trigger anim) -> `action_finish` (server roll).
- **Registry-Driven**: XP and success rates are mapped to `resource_type` on both sides.

## Technical Implementation

### Stack
- **Next.js (App Router)**: UI, routing, login/register API routes.
- **Babylon.js**: 3D game engine, rendering, input.
- **Zustand**: Client game state (`src/utils/game-store.ts`).
- **WebSockets**: Real-time server connection (`src/utils/ws-client.ts`).
- **TypeScript**: Strict typing throughout.

### Folder Structure (Actual)
```bash
src/
├── app/                  # Next.js routes
├── game-client/          # Babylon.js implementation
│   ├── engine.ts         # GameEngine class
│   ├── camera.ts         # GameCamera class
│   ├── input.ts          # Click -> snapToTile -> sendPlayerUpdate
│   ├── world/            # Chunk and Tile management
│   └── entities/         # Player and NPC managers
├── types/mmo/            # Unified protocol and entity types
└── utils/                # Global store and networking logic
```

## Project Roadmap
- [ ] Implement `mmo-shared` package for cross-repo registry sync.
- [ ] Migrate `network.ts` to XOR+HMAC-2B binary protocol.
- [ ] Implement server-side cooldown and location validation.
- [ ] Upgrade to ChaCha20-Poly1305 for enhanced security.
