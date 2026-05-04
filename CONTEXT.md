# CONTEXT - mmo-client

> AI assistant context only. Human docs -> README.md. Task tracking -> TODO.md. Build plan -> PLAN.md.
>
> Cross-repo architecture, protocol, type ownership, and shared conventions live in mmo-docs (github.com/SamNewhouse/mmo-docs). This file contains only repo-specific rules, constraints, and gotchas.

---

## Branch & PR Workflow

See mmo-docs/CONVENTIONS.md for branch naming, PR checklist rules, and comment conventions.

All changes go through a feature branch and a pull request. Nothing is ever committed directly to main, without exception. If a branch cannot be found, stop and ask - do not fall back to main.

---

## Architecture: React vs Babylon

Babylon.js owns the canvas and runs independently of React's render cycle.

- A React useEffect in the game page mounts the Babylon Engine onto a canvas ref via initGame(canvas)
- Babylon's runRenderLoop runs at ~60 fps
- Each frame, the render loop reads nearbyPlayers and myId from the Zustand store using useGameStore.getState() - not the hook, as this is outside React
- React re-renders only for UI state changes (HUD, inventory, login form)

Never manipulate Babylon meshes from a React component. Never dispatch Zustand actions from inside the Babylon render loop (except for debug tooling).

---

## Game Client Singleton (game-client/index.ts)

initGame(canvas) is the entry point. It is guarded - calling it twice is a no-op. Steps in order:

1. Creates GameEngine (Babylon Engine + Scene)
2. Creates GameWorld (lighting)
3. Creates GameCamera (arc-rotate, follows local player)
4. Creates PlayerManager (subscribes to store; spawns meshes on player join/login)
5. Attaches input handlers
6. Starts the render loop
7. Fetches all chunk data via the builder API - guarded with an AbortController so React StrictMode's double-mount does not cause a double-fetch
8. In dev: opens SSE watcher for live chunk hot-reload

destroyGame() disposes the engine, closes the SSE watcher, and nulls all refs. Call it in the useEffect cleanup.

connectGame(token?) calls connectWS, which opens the WebSocket and handles auto-login in dev mode or session resume via token.

---

## Builder API Routes (app/api/builder/)

All routes are dev-only (return 403 in production).

| Route | Method | Description |
|---|---|---|
| /api/builder/regions | GET | Lists all region folders and their chunk coords |
| /api/builder/chunks | GET | Reads and parses every chunk file - returns all tile data in one response |
| /api/builder/chunk | GET | Reads a single chunk file by regionId, chunkX, chunkZ |
| /api/builder/chunk | POST | Writes a chunk file, creates region folder if needed, notifies SSE watchers |
| /api/builder/region | POST | Creates a new region folder |
| /api/builder/watch | GET | SSE stream - pushes chunk_changed events when a chunk is saved |

The individual chunk GET is used by both reloadChunkFromApi (SSE hot-reload) and the loadAllRegions init path. The batch endpoint is available but loadAllRegions currently fetches chunks individually in parallel.

---

## Chunk Hot-Reload (Dev)

The game client opens a persistent SSE connection to /api/builder/watch after init.

- When the map builder saves a chunk (POST /api/builder/chunk), the route calls notifyChunkChanged(regionId, chunkX, chunkZ)
- This pushes a chunk_changed SSE event to all open connections
- The client receives it, calls reloadChunkFromApi, fetches the updated chunk via GET /api/builder/chunk, and calls GameWorld.reloadChunk(chunk)
- No page reload required - tile meshes for that chunk are disposed and rebuilt in-place
- SSE auto-reconnects after 3s on disconnect

---

## Chunk Loader (game-client/world/loader.ts)

- loadAllRegions(world, signal): fetches GET /api/builder/regions to get region + chunk coords, then fetches each chunk's tile data in parallel. AbortSignal is threaded through every fetch call. AbortError is swallowed; any other error propagates.
- reloadChunkFromApi(world, regionId, chunkX, chunkZ): called by the SSE hot-reload handler. Uses its own internal AbortController.

Neither function uses the batch /api/builder/chunks endpoint.

---

## Map Builder (presentation/3-organisms/MapBuilder.tsx)

Dev-only tool at /map-builder.

Rendering: one canvas element per chunk, drawn with TILE_COLORS. Empty padding slots show as + placeholders. Hover shows a brightness overlay; selected chunk shows a blue tint and outline ring.

Zoom and pan:
- Scroll wheel to zoom (native listener with { passive: false } - not React onWheel)
- Middle-click drag to pan
- Click a chunk to focus - smooth CSS transform animates to center the chunk
- Focus zoom level is remembered via useRef - subsequent chunk clicks reuse the last zoom level
- CSS transition is disabled during pan for immediate response

useFocusZoom (utils/use-focus-zoom.ts): manages zoom + translate state. attachWheel(el) registers native listeners. focusChunk(px, pz) centers the given grid-relative coords at the current focus zoom. isPanning is exposed as state so the CSS transition can be disabled during drag.

useZoom (utils/use-zoom.ts): simpler standalone hook for elements that need pinch/wheel zoom without the full focus-chunk logic. Used by the tile palette panel.

---

## Zustand Store (utils/game-store.ts)

Single store, no slices. All WS message types imported from `mmo-shared`.

| Action | Triggered by |
|---|---|
| `onLoginSuccess` | `session_opened` (101) — builds `localPlayer` from `SessionOpenedMessage`, sets `myId` |
| `onPlayerData` | `player_data` (200) — hydrates skills, inventory, equipment onto `localPlayer` |
| `onPlayerJoin` | `player_join` (201) — upserts player into `nearbyPlayers` |
| `onPlayerLeave` | `player_leave` (202) — removes player from `nearbyPlayers` by id |
| `onPlayerStopped` | `player_stopped` (203) — snaps nearby player position, clears `isMoving`. Local player snapping not yet implemented |
| `onPlayerMoveAck` | `player_move_ack` (205) — writes `pendingPath` to store, updates `localPlayer` x/y/floor/z to path destination |
| `clearPendingPath` | called by `PlayerManager` after consuming `pendingPath` |
| `onWorldState` | `world_state` (300) — seeds `nearbyPlayers` from bulk snapshot |
| `onTick` | `tick` (301) — receives `TickMessage`, patches matching `nearbyPlayers` entries |
| `updateSettings` | UI — updates a single top-level key, also calls `patchSettings` from `utils/settings.ts` |
| `onLogout` | session close / logout — clears identity, session, `localPlayer`, `nearbyPlayers` |

---

## Settings (utils/settings.ts)

Persists UserSettings to localStorage under the key mmo-settings.

- loadSettings(): reads and merges with DEFAULT_SETTINGS so new keys are always present
- saveSettings(settings): writes the full settings object as JSON
- patchSettings(key, value): loads, merges a single key, saves, and returns the updated value

UserSettings and DEFAULT_SETTINGS are defined in src/types/mmo/settings.ts.

---

## WebSocket Client (src/ws/)

Singleton - one WebSocket instance per tab. `connectWS(token?)` is the only entry point, exported from `src/ws/client.ts`.

On open in dev mode (`NEXT_PUBLIC_DEV_MODE === "true"`): reads credentials from `dev.ts` and auto-sends a login packet. Otherwise: sends a resume packet with the stored token if provided.

Inbound messages are dispatched via a self-registering handler registry in `src/ws/registry.ts`. Each file under `src/ws/messages/` calls `registerMessageHandler(type, handler)` once at module load time. `src/ws/client.ts` calls `dispatch(msg)` on every inbound message - it contains no routing table.

| `data.type` | Opcode | Handler file | Store action |
|---|---|---|---|
| `session_opened` | 101 | `session-opened.ts` | `onLoginSuccess`, `storeGameSession` |
| `session_rejected` | 102 | `session-rejected.ts` | redirect to login |
| `session_closed` | 103 | `session-close.ts` | `onLogout` |
| `player_data` | 200 | `player-data.ts` | `onPlayerData` |
| `player_join` | 201 | `player-join.ts` | `onPlayerJoin` |
| `player_leave` | 202 | `player-leave.ts` | `onPlayerLeave` |
| `player_stopped` | 203 | `player-stopped.ts` | `onPlayerStopped` |
| `player_move_ack` | 205 | `player-move-ack.ts` | `onPlayerMoveAck(msg.path, msg.pace)` |
| `world_state` | 300 | `world-state.ts` | `onWorldState` |
| `tick` | 301 | `tick.ts` | `onTick` |
| unknown | — | registry fallback | `logger.warn` — never throw |

`session_opened` and `player_data` always arrive in sequence on connect — the client is not fully hydrated until both are received.

Outbound packet files live in `src/ws/packets/`:

| Function | Packet |
|---|---|
| `sendPlayerMove(toX, toZ, path, pace)` | `{ type: 204, x, z, path, pace }` |
| `sendSettings(settings)` | `{ type: "save_settings", settings }` |

---

## HTTP Client (utils/http.ts)

- httpClient: preconfigured AxiosInstance with baseURL from NEXT_PUBLIC_API_URL, 12s timeout, JSON headers
- request(config): thin wrapper around httpClient.request. Normalises Axios errors into { message, status } objects.

---

## Types (src/types/)

src/types/ws-protocol.ts and src/types/mmo/skills.ts have been removed - all WS and skill types come from mmo-shared.

src/types/index.ts is the barrel. Always import from ../../types, not directly from the mmo/ sub-files in game-client code.

- PlayerState is the client-only render shape - extends PlayerPresence with AnimationState and display fields
- StoredPlayer is never used on the client
- PlayerPresence intentionally omits pace - pace is a per-packet PaceMultiplier number, not persistent state
- Derived values (HP, skill levels) are always computed at render time; never stored on PlayerState

---

## Player Rendering (entities/players.ts)

`PlayerManager` holds a `meshes` map keyed by player id.

Local player movement is ACK-gated — the mesh does not move until `player_move_ack` (205) is received. On ACK, `onPlayerMoveAck` writes `pendingPath` to the store and updates `localPlayer` position to the path destination. `PlayerManager`'s store subscription fires, calls `stopAnimation` to cancel any in-progress walk, then calls `animatePath(path)`.

`animatePath(path)` resolves `worldY` per step from `world.getNavNode(step.x, step.z)` and applies `PLAYER.Y_OFFSET`, builds Babylon keyframes via `buildMoveAnimation`, then calls `scene.beginAnimation`.

Remote players are driven by tick data only (`onTick` → `applyTick` on their `PlayerState`).

---

## World & Chunks (game-client/world/)

`GameWorld` owns a `Map<string, GameRegion>` keyed by region id. Public methods: `loadRegion`, `reloadRegion`, `reloadChunk`, `getNavNode`, `dispose`. `GameRegion` owns a `chunks: Map<string, Chunk>` and a `rawData: Map<string, ChunkData>`. On construction and reload, each `Chunk` builds its nav nodes via `buildChunkNavmesh` and they are merged into the shared navmesh via `mergeNavmesh`. `Chunk` constructs tile meshes using `tile-render.ts`, `tile-mesh.ts`, `tile-walls.ts`, and `tile-material-cache.ts`; `dispose()` destroys all meshes.

`GameWorld` also exposes a flat `navmesh: Map<string, NavNode>` covering every tile in every loaded region, rebuilt on each `reloadChunk`. `getNavNode(x, z)` is the single public accessor — used by `animatePath` in `PlayerManager` and by `buildClientPath` in `movement/pathfinding.ts`. Every tile gets a node regardless of walkability; `walkable` and `blockedEdges` are fields on `NavNode`.

`NavNode` carries `worldY` (blended visual height matching tile mesh geometry), `y` (tile height index), `floor`, `walkable`, and `blockedEdges`.

---

## Babylon.js Inspector (Dev)

@babylonjs/inspector is installed as a direct dependency and transpiled via transpilePackages in next.config.mjs (the package ships untranspiled ESM which Next.js cannot handle). The inspector is dynamically imported in scene setup and is never included in production bundles.
