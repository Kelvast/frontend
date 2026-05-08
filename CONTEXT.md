# CONTEXT - client

> AI assistant context only. Human docs → README.md. Task tracking → GitHub Issues.
>
> Cross-repo architecture, protocol, type ownership, and shared conventions live in github.com/Kelvast/docs. This file contains only repo-specific rules, constraints, and gotchas.

---

## Branch & PR Workflow

Never commit directly to main. All work goes on a feature branch created from main — prefix: `feature/`, `fix/`, `docs/`, `refactor/`. If no active branch is known, stop and ask — do not fall back to main.

Open a PR targeting main. Do not merge it — leave it for review. Always fill in the "What does this PR do?" section.

---

## Architecture: React vs Babylon

Babylon.js owns the canvas and runs independently of React's render cycle.

- A React `useEffect` mounts the Babylon `Engine` onto a `<canvas>` ref via `initGame(canvas, signal)`
- Babylon's `runRenderLoop` runs at ~60fps
- Each frame, the render loop reads `nearbyPlayers` and `myId` from Zustand via `useGameStore.getState()` — not the hook, because this runs outside React
- React re-renders only for UI state changes (HUD, inventory, login form)

Never manipulate Babylon meshes from a React component. Never dispatch Zustand actions from inside the Babylon render loop (except debug tooling).

---

## GameEventBus — inter-system communication rule

The client uses a typed in-process event bus as the sole communication layer between all game systems. The pattern is strictly:

```
ws/inbound/   → parse wire message → gameEventBus.emit('domain:verb', payload)
GameEventBus  → synchronous fan-out to all subscribers
systems/      → subscribe via gameEventBus.on() → update store or call Babylon APIs
store         → UI rendering only — never written from WS handlers directly
ws/outbound/  → sendX() helpers only — no logic, no bus emits
```

**Never** write to the Zustand store directly from a WS message handler.
**Never** call a system method directly from an inbound handler.
**Never** emit to the bus from `ws/outbound/`.

The bus is a plain synchronous class — no `EventEmitter` dependency. All payload types in `GameEventMap` derive from `mmo-shared` via `Pick<>` — no inline shape duplication.

All event keys follow the `'domain:verb'` pattern:
- `session:*` — WS session lifecycle
- `player:*` — local player movement state
- `area:*` — world population (joins, leaves, world-state snapshot)
- `action:*` — server-driven action lifecycle
- `world:*` — resource node state
- `input:*` — normalised intent from all input devices

Note: area events are `area:player-joined` and `area:player-left` — **not** `player:joined` / `player:left`.

---

## System init pattern

Each system exports an `initXSystem()` function that subscribes to bus events and returns a teardown function:

```ts
export function initMovementSystem(): () => void {
  const unsub1 = gameEventBus.on('player:move-acked', ({ path, pace }) => { ... });
  const unsub2 = gameEventBus.on('player:stopped', ({ id, x, z }) => { ... });
  return () => { unsub1(); unsub2(); };
}
```

`bootstrapGameClient(ws)` in `src/game-client/bootstrap.ts` calls all init functions in order and returns the combined teardown. This is called from the game component's `useEffect` — the returned teardown is the cleanup function.

---

## Zustand store — UI only

The store is the bridge between game systems and the React UI. Systems write to it; React reads from it. WS message handlers never write to it directly.

Single store, no slices. All WS message types imported from `mmo-shared`.

| Action | Triggered by |
|---|---|
| `setMyId` | `systems/session.ts` on `session:opened` |
| `setLocalPlayer` | `systems/session.ts` on `session:opened` |
| `onPlayerData` | `systems/session.ts` on `session:player-data` — hydrates skills, inventory, equipment |
| `addNearbyPlayer` | `systems/players.ts` on `area:player-joined` |
| `removeNearbyPlayer` | `systems/players.ts` on `area:player-left` |
| `onPlayerStopped` | `systems/movement.ts` on `player:stopped` — snaps position, clears `isMoving` for local and nearby |
| `onPlayerMoveAck` | `systems/movement.ts` on `player:move-acked` — sets `isMoving: true`, does NOT update x/z |
| `onPlayerArrived` | called by `PlayerManager` when mesh reaches destination tile |
| `onTick` | `systems/movement.ts` on `player:tick` — patches `nearbyPlayers` and `localPlayer` from tick deltas |
| `updateSettings` | UI — updates a single top-level key, calls `patchSettings` |
| `onLogout` | `systems/session.ts` on `session:closed` — clears all session state |

`localPlayer.x/z` is updated by `onTick` deltas and `onPlayerArrived` — **never** set to the destination immediately on ACK.

---

## Game Client Singleton (game-client/index.ts)

`initGame(canvas, signal)` is the entry point. Guarded — calling it twice is a safe no-op. Steps in order:

1. `Engine` created from canvas ref
2. `GameWorld` created (lighting)
3. `loadAllRegions` called — fetches all chunk data, `AbortSignal` threaded through every fetch
4. `GameCamera` created
5. `PlayerManager` created, local player mesh spawned
6. `bootstrapGameClient(ws)` called — inits all systems in correct order, returns teardown
7. Input handlers attached (`KeysInput`, `PointerInput`)
8. `engine.runRenderLoop` started
9. In dev: SSE watcher opened for chunk hot-reload

`destroyGame()` stops the watcher, calls `gameEventBus.clear()`, disposes the engine, and nulls all refs. Always call it in the `useEffect` cleanup.

`connectGame()` is async and separate from `initGame` — the engine can exist without a live WS connection. In dev mode it bypasses the session fetch and opens WS directly using `getDevCredentials()`.

---

## WS inbound layer (ws/inbound/)

Files parse a single wire message type and emit one or more bus events. No store writes. No Babylon calls. No `ws.send()`.

| File | Messages handled | Bus events emitted |
|---|---|---|
| `movement.ts` | `player_move_ack`, `player_stopped`, `tick` | `player:move-acked`, `player:stopped`, `player:tick` |
| `area.ts` | `player_join`, `player_leave`, `world_state` | `area:player-joined`, `area:player-left`, `area:world-state` |
| `resume.ts` | `session_opened` | `session:opened` |
| `session.ts` | `session_closed`, `session_rejected`, `player_data` | `session:closed`, `session:rejected`, `session:player-data` |
| `actions.ts` | `action_ongoing`, `action_finished` | `action:ongoing`, `action:finished` |
| `world.ts` | `resource_depleted`, `resource_available` | `world:resource-depleted`, `world:resource-available` |

---

## WS outbound layer (ws/outbound/)

Typed `sendX()` helpers. No logic, no store reads, no bus emits. The `ws` instance is always passed in as a parameter — never imported as a global.

| Function | Packet |
|---|---|
| `sendPlayerMove(ws, path, pace)` | `{ type: 204, path, pace }` |
| `sendSessionResume(ws, token)` | `{ type: 100, token }` |
| `sendSessionClose(ws)` | `{ type: 103 }` |

---

## PointerInput — click handler registry

`PointerInput` holds a priority-ordered handler registry. Systems register handlers at bootstrap — `PointerInput` never imports from game systems directly.

| Priority | System | Condition |
|---|---|---|
| 100 | Combat | Clicked mesh is an NPC |
| 50 | Actions | Clicked mesh is a resource node |
| 10 | Ground items | Clicked mesh is a ground item |
| 0 | Movement | Default fallback |

The first handler to return `true` consumes the click. Movement (priority 0) is always the fallback.

---

## requestMove guards

Two guards in `movement/movement.ts` prevent duplicate move packets:

1. `isMoving` check — if `localPlayer.isMoving` is `true`, return early (player already walking)
2. Tick-rate gate — one `sendPlayerMove` per `TICK_INTERVAL_MS` maximum

The `isMoving` check runs first (cheaper store read). The tick gate is a secondary guard.

---

## PlayerManager — position only, no animation

`PlayerManager` owns mesh lifecycle (create, pool, position) only. It subscribes to `localPlayer.x/z` in the store and calls `teleportToTile(x, z)` when position changes. It does not call any Babylon animation APIs — those belong to `PlayerAnimationManager` (client/85).

On position change, `PlayerManager` emits `player:arrived` on the bus once the mesh is placed.

Remote players are driven by tick data via `systems/players.ts` → `PlayerManager.applyMovementDelta(delta)`.

---

## Builder API Routes (app/api/builder/)

All routes are dev-only (return 403 in production).

| Route | Method | Description |
|---|---|---|
| `/api/builder/regions` | GET | Lists all region folders and their chunk coords |
| `/api/builder/chunks` | GET | Reads and parses every chunk file |
| `/api/builder/chunk` | GET | Reads a single chunk file by regionId, chunkX, chunkZ |
| `/api/builder/chunk` | POST | Writes a chunk file, notifies SSE watchers |
| `/api/builder/region` | POST | Creates a new region folder |
| `/api/builder/watch` | GET | SSE stream — pushes `chunk_changed` events on save |

---

## Chunk hot-reload (dev)

- `POST /api/builder/chunk` calls `notifyChunkChanged(regionId, chunkX, chunkZ)`
- Pushes `chunk_changed` SSE event to all open connections on `/api/builder/watch`
- Client receives it, calls `reloadChunkFromApi`, fetches the updated chunk, calls `GameWorld.reloadChunk(chunk)`
- No page reload required — tile meshes for that chunk are disposed and rebuilt in-place
- SSE auto-reconnects after 3s on disconnect

---

## HTTP clients (utils/http.ts)

**Server-side** (`httpClient` / `request`) — Next.js route handlers only. `baseURL` is `API_URL` (server-only env var, never `NEXT_PUBLIC_`). Never import in browser code.

**Browser-side** (`browserClient` / `browserRequest`) — client-side code calling Next.js API routes. No `baseURL` — paths resolve relative to page origin. Never use in route handlers.

Both normalise Axios errors into `HttpError` objects via `handleAxiosError`.

---

## Types (src/types/)

All WS and skill types come from `mmo-shared` — `src/types/ws-protocol.ts` and `src/types/mmo/skills.ts` have been removed.

`src/types/index.ts` is the barrel. Always import from `../../types`, not directly from sub-files.

- `PlayerState` — client-only render shape, extends `PlayerPresence` with `animationState` and display fields
- `StoredPlayer` — never used on the client
- Derived values (HP, skill levels) always computed at render time — never stored on `PlayerState`

---

## World & Chunks (game-client/world/)

`GameWorld` owns a `Map<string, GameRegion>` keyed by region id. Public methods: `loadRegion`, `reloadRegion`, `reloadChunk`, `getNavNode`, `dispose`.

`getNavNode(x, z)` is the single public accessor — used by `PlayerManager` and `movement/pathfinding.ts`. Every tile gets a node regardless of walkability; `walkable` and `blockedEdges` are fields on `NavNode`. `NavNode` carries `worldY` (blended visual height), `y` (tile height index), `floor`, `walkable`, and `blockedEdges`.

---

## Settings (utils/settings.ts)

Persists `UserSettings` to `localStorage` under the key `mmo-settings`.

- `loadSettings()` — reads and merges with `DEFAULT_SETTINGS`
- `saveSettings(settings)` — writes full object as JSON
- `patchSettings(key, value)` — loads, merges single key, saves, returns updated value

`UserSettings` and `DEFAULT_SETTINGS` defined in `src/types/mmo/settings.ts`.

---

## Dev auto-login

In dev mode (`NEXT_PUBLIC_DEV_MODE === "true"`), `connectGame()` skips `POST /api/game/session`. Reads credentials from `src/utils/dev.ts` via `getDevCredentials()`, opens WS directly, sends `session_resume` with a dev token.

---

## Logger levels

```ts
logger.log(...)    // general — dev only
logger.warn(...)   // warnings — dev only
logger.error(...)  // errors — always on
logger.ws(...)     // WebSocket events — dev only
logger.game(...)   // Babylon/game events — dev only
```

---

## Babylon.js Inspector (dev)

`@babylonjs/inspector` is installed as a direct dependency and transpiled via `transpilePackages` in `next.config.mjs`. Dynamically imported in scene setup — never included in production bundles.

---

## `mmo-shared` as a local package

```json
"mmo-shared": "file:../mmo-shared"
```

Always rebuild `mmo-shared` after source changes (`npm run build`). If consuming repos behave unexpectedly after a type change, check whether `dist/` is stale.

---

## TypeScript — Node globals in scripts

`tsconfig.json` includes `"types": ["node"]`. Required for Node globals in scripts run via `tsx`. Do not remove this field.

---

## Dev tooling — chunk-seam scripts

`scripts/chunk-seams/` — dev-only, never run in production.

| Script | Effect |
|---|---|
| `npm run seams` | Report border mismatches only — no writes |
| `npm run seams:fix` | Snap mismatched border tiles |
| `npm run seams:ease` | Smooth interior slope gradients |
| `npm run seams:fix:ease` | Fix seams then ease slopes in one pass |
| `npm run seams:format` | Fix + ease then run Prettier |

No confirmation prompts — all modes write immediately. Re-run `npm run seams` after any fix/ease pass to verify.
