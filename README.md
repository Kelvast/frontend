# mmo-client

Browser-based 3D MMO client. Built with Next.js, Babylon.js, and Zustand.

For cross-repo architecture, protocol, and system documentation see mmo-docs (github.com/SamNewhouse/mmo-docs).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| 3D Engine | Babylon.js 9 |
| State | Zustand |
| Real-time | WebSocket (ws-client.ts) + SSE (/api/builder/watch) |
| HTTP | Axios wrapper (http.ts) |
| Shared types/logic | mmo-shared |
| Language | TypeScript - strict throughout |

---

## Getting Started

npm install
npm run dev

Copy .env.example to .env.local:

| Variable | Description |
|---|---|
| NEXT_PUBLIC_MMO_SERVER_URL | WebSocket server - e.g. ws://localhost:8080 |
| NEXT_PUBLIC_DEV_MODE | Set true to enable verbose logging and dev auto-login |
| NEXT_PUBLIC_DEV_EMAIL | Dev auto-login email |
| NEXT_PUBLIC_DEV_PASSWORD | Dev auto-login password |

---

## Scripts

npm run dev      - development server
npm run build    - production build
npm run start    - production server
npm run format   - prettier format

---

## Folder Structure

src/
  app/
    api/
      auth/
        login/         POST /api/auth/login (not yet implemented)
        register/      POST /api/auth/register (not yet implemented)
      builder/
        chunk/         GET + POST single chunk
        chunks/        GET all chunks (batch)
        region/        POST create region
        regions/       GET all regions + coords
        watch/         GET SSE chunk-change stream
    game/              Game page
    login/             Login page
    map-builder/       Map builder page (dev only)
    layout.tsx
  config/              Environment and config variable bindings
  game-client/         All Babylon.js logic - no React inside here
    index.ts           initGame / connectGame / destroyGame
    engine.ts          GameEngine
    camera.ts          GameCamera
    constants.ts       WORLD, CAMERA, PLAYER, CHUNK_LOADING
    entities/
      players.ts       PlayerManager
    input/
      keys.ts
      pointer.ts
    movement/
      index.ts
      animation.ts
      speed.ts
      waypoints.ts
    world/
      index.ts         GameWorld
      loader.ts        loadAllRegions, reloadChunkFromApi
      region.ts        GameRegion
      chunk.ts         Chunk - 16x16 tile mesh grid
      tile-config.ts
      tile-height.ts
      regions/         Chunk data files: regionId/chunkX_chunkZ.ts
  presentation/
    1-atoms/
    2-molecules/
    3-organisms/       GameCanvas, LoginForm, MapBuilder
    4-layouts/
    5-pages/
  types/
    index.ts           Barrel - re-exports all client-only types
    mmo/
      builder.ts
      world.ts
      player.ts        PlayerState, AnimationState
      game-state.ts    GameStoreState
      entities.ts
      network.ts
      position.ts
      settings.ts      UserSettings, DEFAULT_SETTINGS
      structure.ts
  utils/
    game-store.ts      Zustand store
    ws-client.ts       WebSocket singleton
    xp.ts              Re-exports from mmo-shared; maxHpFromSkills
    settings.ts        loadSettings / saveSettings / patchSettings
    http.ts            Axios wrapper
    logger.ts
    use-focus-zoom.ts
    use-zoom.ts
    chunk-spiral.ts
    builder-grid.ts
    chunk-export.ts
    chunk-parse.ts
    tile-colors.ts
    response.ts
    site.ts
    dev.ts

---

## Logging

All logging goes through src/utils/logger.ts. Raw console.log is banned.

logger.log    - general (dev only)
logger.warn   - warnings (dev only)
logger.error  - errors (always on)
logger.ws     - WebSocket events (dev only)
logger.game   - Babylon/game events (dev only)
