# MMO Client

## Overview

A browser-based 3D MMO client built with **Next.js**, **Babylon.js**, and **Zustand**. Players move around a tile-based world, interact with others in real-time, and progress through skills, combat, and quests.

***

## Game Systems

### Movement
Players move by clicking a tile on the ground. The client snaps the click to the nearest tile centre using `snapToTile` and sends the new position to the server. The server validates the move and broadcasts it to nearby players. Remote players interpolate smoothly to their new position. **WASD moves the camera only, not the player.**

### Player Sync
The server maintains an interest area of 3 chunks around each player. Only players within that radius are ever sent to a client.

#### Session Index
On init, each player in range is assigned a small integer index for that session. All delta updates reference this index instead of the full ID to keep tick payloads minimal.

```ts
// INIT — sent once
{ type: 'player_init', id: '74m48m4...', index: 4, name: 'User', hp: 100 }

// DELTA — sent every tick
{ t: 1234, p: [[4, 10, 15, 1, 98], [7, 22, 8, 0, 100]] }
```

### World Architecture
The world is divided into **Regions**, each containing an infinite grid of **Chunks** (16x16 tiles). Chunks are terrain data fetched directly by the client and cached for the session.

### Entity System
- **Players**: Occupy one tile. Local player state managed in Zustand.
- **NPCs**: Fixed home positions defined outside of chunk data. Loaded as a separate layer after terrain.

***

## Tech Stack
- **Next.js** (App Router)
- **Babylon.js** (3D Engine)
- **Zustand** (State Management)
- **WebSockets** (Real-time Sync)
- **TypeScript** (Strict)

***

## Project Workflow
This project follows a strict documentation and code management policy:
- **Atomic Updates**: All changes are treated as atomic units.
- **Review Policy**: Changes are submitted via Pull Request on dedicated branches.
- **Manual Merge**: AI assistants are prohibited from merging PRs. All merges must be performed manually by the repository owner after review.

***

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure environment variables in `.env`.
4. Run the development server: `npm run dev`.
