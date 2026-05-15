# kelvast-client

Browser-based 3D MMO client. Built with Next.js, Babylon.js, and Zustand.

For cross-repo architecture, protocol, and system documentation see [github.com/Kelvast/docs](https://github.com/Kelvast/docs).

---

## Tech Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| Framework          | Next.js (App Router)                                    |
| 3D Engine          | Babylon.js 9                                            |
| State              | Zustand                                                 |
| Real-time          | WebSocket (`ws-client.ts`) + SSE (`/api/builder/watch`) |
| Shared types/logic | kelvast-shared                                          |
| Language           | TypeScript - strict throughout                          |

---

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local`:

| Variable                     | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_MMO_SERVER_URL` | WebSocket server - e.g. `ws://localhost:8080`           |
| `NEXT_PUBLIC_DEV_MODE`       | Set `true` to enable verbose logging and dev auto-login |
| `NEXT_PUBLIC_DEV_EMAIL`      | Dev auto-login email                                    |
| `NEXT_PUBLIC_DEV_PASSWORD`   | Dev auto-login password                                 |

---

## Scripts

| Command          | Effect             |
| ---------------- | ------------------ |
| `npm run dev`    | Development server |
| `npm run build`  | Production build   |
| `npm run start`  | Production server  |
| `npm run format` | Prettier format    |

### Chunk Seam Scripts

| Command                  | Effect                                    |
| ------------------------ | ----------------------------------------- |
| `npm run seams`          | Report border mismatches only - no writes |
| `npm run seams:fix`      | Snap mismatched border tiles              |
| `npm run seams:ease`     | Smooth interior slope gradients           |
| `npm run seams:fix:ease` | Fix seams then ease slopes in one pass    |
| `npm run seams:format`   | Fix + ease then run Prettier              |

---

## Architecture

### React vs Babylon

Babylon.js owns the canvas and runs independently of React's render cycle.

- A React `useEffect` mounts the Babylon `Engine` onto a `<canvas>` ref via `initGame(canvas, signal)`
- Babylon's `runRenderLoop` runs at ~60fps
- Each frame, the render loop reads state from Zustand via `useGameStore.getState()` - not the hook, because this runs outside React
- React re-renders only for UI state changes (HUD, inventory, login form)

### Event Bus

All inter-system communication on the client goes through `GameEventBus`. The flow is:

```
ws/inbound/  ->  parse wire message  ->  emitX(payload)
GameEventBus ->  synchronous fan-out to all subscribers
systems/     ->  subscribe via onX()  ->  update store or call Babylon APIs
store        ->  UI rendering only
ws/outbound/ ->  sendX() helpers only
```

### Game Client Singleton (`game-client/index.ts`)

`initGame(canvas, signal)` is the entry point. Guarded - calling it twice is a safe no-op. Steps in order:

1. `Engine` created from canvas ref
2. `GameWorld` created (lighting)
3. `loadAllRegions` called - fetches all chunk data, `AbortSignal` threaded through every fetch
4. `GameCamera` created
5. `PlayerManager` created, local player mesh spawned
6. `bootstrapGameClient(ws)` called - inits all systems in correct order, returns teardown
7. Input handlers attached (`KeysInput`, `PointerInput`)
8. `engine.runRenderLoop` started
9. In dev: SSE watcher opened for chunk hot-reload

`destroyGame()` stops the watcher, calls `gameEventBus.clear()`, disposes the engine, and nulls all refs. Always call it in the `useEffect` cleanup.

`connectGame()` is async and separate from `initGame` - the engine can exist without a live WS connection. In dev mode it bypasses the session fetch and opens WS directly using `getDevCredentials()`.

### World & Chunks (`game-client/world/`)

`GameWorld` owns a `Map<string, GameRegion>` keyed by region id. Public methods: `loadRegion`, `reloadRegion`, `reloadChunk`, `getNavNode`, `dispose`.

`getNavNode(x, z)` is the single public accessor - used by `PlayerManager` and `movement/pathfinding.ts`. Every tile gets a node regardless of walkability. `NavNode` carries `worldY` (blended visual height), `y` (tile height index), `floor`, `walkable`, and `blockedEdges`.

### Settings (`utils/settings.ts`)

Persists `UserSettings` to `localStorage` under the key `kelvast-settings`.

- `loadSettings()` - reads and merges with `DEFAULT_SETTINGS`
- `saveSettings(settings)` - writes full object as JSON
- `patchSettings(key, value)` - loads, merges single key, saves, returns updated value

---

## Builder API Routes (dev only)

All routes return 403 in production.

| Route                  | Method | Description                                                 |
| ---------------------- | ------ | ----------------------------------------------------------- |
| `/api/builder/regions` | GET    | Lists all region folders and their chunk coords             |
| `/api/builder/chunks`  | GET    | Reads and parses every chunk file                           |
| `/api/builder/chunk`   | GET    | Reads a single chunk file by `regionId`, `chunkX`, `chunkZ` |
| `/api/builder/chunk`   | POST   | Writes a chunk file, notifies SSE watchers                  |
| `/api/builder/region`  | POST   | Creates a new region folder                                 |
| `/api/builder/watch`   | GET    | SSE stream - pushes `chunk_changed` events on save          |

### Chunk hot-reload

- `POST /api/builder/chunk` calls `notifyChunkChanged(regionId, chunkX, chunkZ)`
- Pushes `chunk_changed` SSE event to all open connections on `/api/builder/watch`
- Client receives it, calls `reloadChunkFromApi`, fetches the updated chunk, calls `GameWorld.reloadChunk(chunk)`
- No page reload required - tile meshes for that chunk are disposed and rebuilt in-place
- SSE auto-reconnects after 3s on disconnect

---

## Logging

All logging goes through `src/utils/logger.ts`. Raw `console.log` is banned.

| Level          | When                           |
| -------------- | ------------------------------ |
| `logger.log`   | General - dev only             |
| `logger.warn`  | Warnings - dev only            |
| `logger.error` | Errors - always on             |
| `logger.ws`    | WebSocket events - dev only    |
| `logger.game`  | Babylon/game events - dev only |

---

## Babylon.js Inspector (dev)

`@babylonjs/inspector` is installed as a direct dependency and transpiled via `transpilePackages` in `next.config.mjs`. Dynamically imported in scene setup - never included in production bundles.

---

## Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/            POST /api/auth/login, POST /api/auth/register
│   │   └── builder/         chunk CRUD, region CRUD, SSE chunk-change stream
│   ├── game/                game page
│   ├── login/               login page
│   └── map-builder/         map builder page (dev only)
├── config/                  environment and config variable bindings
├── game-client/             all Babylon.js logic - no React inside here
│   ├── systems/             one file per system - each exports initXSystem()
│   ├── ws/
│   │   ├── inbound/         one file per message domain - emits bus events
│   │   └── outbound/        sendX() helpers
│   ├── events/              GameEventBus, GAME_EVENT, emitX/onX helpers, types
│   ├── entities/            PlayerManager
│   ├── input/               keys, pointer
│   ├── movement/            pathfinding, animation, speed, waypoints
│   └── world/               GameWorld, regions, chunks, tile config
├── presentation/
│   ├── 1-atoms/
│   ├── 2-molecules/
│   ├── 3-organisms/         GameCanvas, LoginForm, MapBuilder
│   ├── 4-layouts/
│   └── 5-pages/
├── types/                   client-only types barrel - always import from here
├── utils/                   store, ws-client, http, logger, settings, helpers
└── scripts/
    └── chunk-seams/         dev tooling for border mismatch detection and fixing
```
