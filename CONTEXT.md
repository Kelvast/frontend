# CONTEXT — mmo-client

## Branch & PR Workflow

All changes — including documentation — go through a feature branch and a pull request. **Nothing is ever committed directly to `main`, without exception.**

```
1. Create a feature branch from main
2. Do all work on that branch
3. Open a PR targeting main
4. Do NOT merge — leave it open for review and approval
```

**Never commit to `main` directly.** If a branch cannot be found, stop and ask — do not fall back to `main`.

## PR & Checklist Rules

- Checklists only contain items relevant to this repo — no cross-repo todos
- Only include checklist items for things the PR has actually changed
- Do not add "Branch created from main" or "PR targets main" to checklists
- Cross-repo follow-up tasks go in the Open Tasks section of the relevant repo's CONTEXT.md, not the PR checklist

---

## Architecture: React vs Babylon

Babylon.js owns the canvas and runs independently of React's render cycle. The integration contract is:

- A React `useEffect` in the game page mounts the Babylon `Engine` onto a `<canvas>` ref via `initGame(canvas)`
- Babylon's `runRenderLoop` runs at ~60 fps
- Each frame, the render loop reads `nearbyPlayers` and `myId` from the Zustand store using `useGameStore.getState()` (not the hook — this is outside React)
- React re-renders only for UI state changes (HUD, inventory, login form)

**Never** manipulate Babylon meshes from a React component. **Never** dispatch Zustand actions from inside the Babylon render loop (except for debug tooling).

---

## Game Client Singleton (`game-client/index.ts`)

`initGame(canvas)` is the entry point. It is guarded — calling it twice is a no-op. It is `async`:

1. Creates `GameEngine` (Babylon Engine + Scene)
2. Creates `GameWorld` (lighting)
3. Creates `GameCamera` (arc-rotate, follows local player)
4. Creates `PlayerManager` (spawns local player box mesh)
5. Attaches input handlers
6. Starts the render loop
7. Fetches all chunk data via the builder API and loads into the world — guarded with an `AbortController` so React StrictMode's double-mount does not cause a double-fetch
8. In dev: opens SSE watcher for live chunk hot-reload

`destroyGame()` disposes the engine, closes the SSE watcher, and nulls all refs. Call it in the `useEffect` cleanup.

`connectGame(token?)` calls `connectWS`, which opens the WebSocket and handles auto-login in dev mode or session resume via token.

---

## Chunk File Format

Chunk files live under `src/game-client/world/regions/<regionId>/<chunkX>_<chunkZ>.ts`.

- Separator is `_` (underscore) — not `-` — to avoid ambiguity with negative coordinates.
- Example: `0_0.ts`, `-1_2.ts`, `0_-1.ts`
- There are **no `index.ts` files** per region. The API scans folders directly.
- `buildRegion` and `require.context` are gone — all chunk loading goes through the API.

---

## Builder API Routes (`app/api/builder/`)

All routes are dev-only (return 403 in production).

| Route | Method | Description |
|---|---|---|
| `/api/builder/regions` | GET | Lists all region folders and their chunk coords |
| `/api/builder/chunks` | GET | Reads and parses every chunk file — returns all tile data in one response |
| `/api/builder/chunk` | GET | Reads a single chunk file by `regionId`, `chunkX`, `chunkZ` |
| `/api/builder/chunk` | POST | Writes a chunk file, creates region folder if needed, notifies SSE watchers |
| `/api/builder/region` | POST | Creates a new region folder |
| `/api/builder/watch` | GET | SSE stream — pushes `chunk_changed` events when a chunk is saved |

The individual chunk GET is used by both `reloadChunkFromApi` (SSE hot-reload path) and the `loadAllRegions` init path. The batch endpoint (`/api/builder/chunks`) is available but `loadAllRegions` currently fetches chunks individually in parallel after resolving the regions list.

---

## Chunk Hot-Reload (Dev)

In development the game client opens a persistent SSE connection to `/api/builder/watch` after init.

- When the map builder saves a chunk (`POST /api/builder/chunk`), the route calls `notifyChunkChanged(regionId, chunkX, chunkZ)`
- This pushes a `chunk_changed` SSE event to all open connections
- The game client receives it, calls `reloadChunkFromApi`, which fetches the updated chunk via `GET /api/builder/chunk` and calls `GameWorld.reloadChunk(chunk)`
- No page reload required — the tile meshes for that chunk are disposed and rebuilt in-place
- SSE auto-reconnects after 3s on disconnect

---

## Chunk Loader (`game-client/world/loader.ts`)

Two exported functions:

- `loadAllRegions(world, signal)` — called on init. Fetches `GET /api/builder/regions` to get region + chunk coords, then fetches each chunk's tile data in parallel. The `AbortSignal` is threaded through every `fetch` call so in-flight requests are cancelled cleanly if React StrictMode unmounts before completion. `AbortError` is swallowed; any other error propagates.
- `reloadChunkFromApi(world, regionId, chunkX, chunkZ)` — called by the SSE hot-reload handler. Uses its own internal `AbortController`; has no external lifecycle to hook into.

Neither function uses the batch `/api/builder/chunks` endpoint — they build the region list from `/api/builder/regions` and fetch tiles per-chunk.

---

## Map Builder (`presentation/3-organisms/MapBuilder.tsx`)

A dev-only tool at `/map-builder` for painting and editing the world grid.

### Grid
- Renders all chunks seamlessly (no gaps) using `<canvas>` elements — one canvas per chunk, drawn with `TILE_COLORS`
- Empty padding slots around existing chunks show as `+` placeholders for creating new chunks
- Hover shows a brightness overlay; selected chunk shows a blue tint + outline ring

### Zoom & Pan
- Scroll wheel to zoom (native listener, `{ passive: false }` — not React `onWheel`)
- Middle-click drag to pan
- Click a chunk to focus — smooth CSS `transform: scale + translate` animates to center the chunk with context around it
- Focus zoom level is remembered via `useRef` — subsequent chunk clicks reuse the last zoom level
- Manual zoom (buttons or scroll) updates the remembered level
- CSS transition is disabled during pan for immediate response

### `useFocusZoom` (`utils/use-focus-zoom.ts`)
Manages zoom + translate state for the map builder viewport. Key behaviours:
- `attachWheel(el)` — registers native wheel + mouse listeners on the viewport element
- `focusChunk(px, pz)` — centers the given grid-relative pixel coords at the current focus zoom
- `lastFocusZoomRef` — persists last zoom across chunk selections without triggering re-renders
- `isPanning` — exposed as state so the CSS transition can be disabled during drag

### `useZoom` (`utils/use-zoom.ts`)
Simpler standalone hook for elements that need pinch/wheel zoom without the full focus-chunk logic. Used by the map builder's tile palette panel.

---

## Zustand Store (`utils/game-store.ts`)

Single store, no slices. All WS message types are imported from `mmo-shared`. Full shape:

```ts
interface GameStoreState {
  myId:             number | null
  nearbyPlayers:    PlayerState[]
  worldTime:        number
  isConnected:      boolean
  latency:          number
  sessionToken:     string | null
  sessionExpiresAt: number | null
  settings:         UserSettings

  setMyId:           (id: number) => void
  setConnected:      (connected: boolean) => void
  setLatency:        (latency: number) => void
  setSession:        ({ sessionToken, sessionExpiresAt }) => void
  updateSettings:    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
  hydrateLocalPlayer:(msg: LoginSuccessMsg) => void
  registerPlayer:    (msg: PlayerJoinMsg) => void
  unregisterPlayer:  (id: number) => void
  applyTick:         (msg: TickMsg) => void
}
```

There is **no** `indexRegistry` — the server now sends a numeric `id` on every message and `PlayerState` is keyed by `id` directly.

### `hydrateLocalPlayer`

Called on `login_success`. Builds the full `PlayerState` from `LoginSuccessMsg` (which includes `skills` and `inventory`) and upserts into `nearbyPlayers`. Also sets `myId`.

### `registerPlayer`

Called on `player_join` and `world_state` entries. Remote players seed `skills`/`inventory`/`equipment` with `defaultSkills()` / `defaultInventory()` / `defaultEquipment()` from `mmo-shared` until a dedicated state message arrives.

### `applyTick`

Receives `TickMsg` (`{ t, p: [id, x, y, z, facing][] }`). Builds a `Map<id, delta>` for O(1) lookup and patches matching `PlayerState` entries.

### `updateSettings`

Updates a single top-level key on `settings` in the store. Also persists via `saveSettings` from `utils/settings.ts`.

---

## Settings (`utils/settings.ts`)

Persists `UserSettings` to `localStorage` under the key `mmo-settings`.

- `loadSettings()` — reads and merges with `DEFAULT_SETTINGS` so new keys added to the type are always present
- `saveSettings(settings)` — writes the full settings object as JSON
- `patchSettings(key, value)` — loads, merges a single key at the object level, saves, and returns the updated value

`UserSettings` and `DEFAULT_SETTINGS` are defined in `src/types/mmo/settings.ts`.

---

## WebSocket Client (`utils/ws-client.ts`)

Singleton — one `WebSocket` instance per tab. `connectWS(token?)` is the only entry point. On open:

- Dev mode (`NEXT_PUBLIC_DEV_MODE === "true"`) — reads credentials from `dev.ts` and auto-sends a `login` packet
- Otherwise — sends a `resume` packet with the stored token if provided

### Inbound message routing

| `data.type` | Action |
|---|---|
| `login_success` | `hydrateLocalPlayer`, `setSession` |
| `world_state` | `registerPlayer` for each player in snapshot — bulk viewport init on login |
| `player_join` | `registerPlayer` |
| `player_leave` | `unregisterPlayer(data.id)` |
| `player_stopped` | snap position via `applyTick` synthetic delta |
| `tick` | `applyTick` |
| `pong` | update `latency` from round-trip delta |
| `logout_success` | clear session, disconnect |
| `auth_fail` | dev: auto-register; prod: `logger.error` |
| `error` | `logger.error` |
| unknown | `logger.warn` — never throw |

### Outbound

| Function | Packet sent |
|---|---|
| `sendPlayerMove(x, y, z, facing)` | `{ type: "move", x, y, z, facing }` |
| `sendPing()` | `{ type: "ping", t: Date.now() }` |
| `sendSettings(settings)` | `{ type: "save_settings", settings }` |

---

## HTTP Client (`utils/http.ts`)

Axios wrapper. Provides two exports:

- `httpClient` — preconfigured `AxiosInstance` with `baseURL` from `NEXT_PUBLIC_API_URL`, 12s timeout, JSON headers
- `request<T>(config)` — thin wrapper around `httpClient.request`. Normalises Axios errors into `{ message, status }` objects so call sites receive a consistent error shape. Used by all server-side API calls (auth, builder).

---

## Auth Flow

```
Mount → check localStorage for sessionToken
  ├─ found  → connectGame(token) → sends ResumePacket
  └─ absent → render LoginForm  → POST /api/login or /api/register
                                  → on success: store token, connectGame(token)

login_success received:
  hydrateLocalPlayer(data)   ← sets myId + full PlayerState incl. skills/inventory
  setSession({ sessionToken, sessionExpiresAt })
  → transition to game view

world_state received:
  registerPlayer for each entry
  → populates nearbyPlayers for the initial viewport
```

The raw session key (`Buffer`, 32 bytes) is **never** written to `localStorage`. It lives only in memory for the duration of the tab session.

---

## XP & Skills (`utils/xp.ts`)

All XP/level maths live in `mmo-shared`. `src/utils/xp.ts` re-exports what the client needs:

```ts
export { xpToLevel, levelToXp, xpToNextLevel, getSkillLevel, addXp } from "mmo-shared";
```

`maxHpFromSkills(skills)` is the only client-only helper — it lives in `xp.ts` and is not in `mmo-shared` because combat is not yet on the server.

`PlayerState.skills` stores raw XP (`Skills` type from `mmo-shared`). Never store derived levels — always call `xpToLevel` / `getSkillLevel` when you need a level value.

---

## Types (`src/types/`)

Types are split between this repo and `mmo-shared`:

| Source | Types |
|---|---|
| `mmo-shared` | `Skills`, `SkillId`, `Inventory`, `Equipment`, `Facing`, all WS message/packet types |
| `src/types/mmo/player.ts` | `PlayerState`, `AnimationState` — client-only render state |
| `src/types/mmo/game-state.ts` | `GameStoreState` — Zustand store shape |
| `src/types/mmo/network.ts` | `LoginPayload`, `RegisterPayload` — HTTP auth form shapes |
| `src/types/mmo/settings.ts` | `UserSettings`, `CameraSettings`, `DEFAULT_SETTINGS` |
| `src/types/mmo/world.ts` | `Tile`, `ChunkData`, `Region`, `World`, `TileType`, `TileHeight` |
| `src/types/mmo/structure.ts` | `Structure`, `WallFace`, `Floor`, etc. |
| `src/types/mmo/builder.ts` | `BuilderRegion`, `BuilderRegionsResponse`, `BuilderSaveRequest` |
| `src/types/mmo/entities.ts` | `NPC`, `Interactable` |
| `src/types/mmo/position.ts` | `Position`, `ZERO_POSITION` |

`src/types/ws-protocol.ts` and `src/types/mmo/skills.ts` have been **removed** — all WS and skill types now come from `mmo-shared`.

`src/types/index.ts` is the barrel — it re-exports all client-only types. Always import from `../../types` not directly from the `mmo/` sub-files in game-client code.

---

## Player Rendering (`entities/players.ts`)

`PlayerManager` holds a `meshes: Record<string, AbstractMesh>` map keyed by player `id`. Each render frame, `syncPlayers(nearbyPlayers, myId)` is called:

1. For each player in store — if no mesh exists, `spawnPlayer` creates a box mesh; otherwise `updatePlayer` lerps its position
2. For each mesh key not in the store — `removePlayer` disposes the mesh

Local player has its own `localMesh` reference (blue box). Remote players are orange boxes.

---

## World & Chunks (`game-client/world/`)

`GameWorld` owns a `Map<string, GameRegion>` registry. Key methods:

- `loadRegion(data)` — loads a full region (used on bulk init)
- `loadChunk(chunk)` — adds a single chunk to an existing or new region (used for streaming)
- `hasChunk(x, z)` — checks if a chunk is already loaded
- `reloadChunk(chunk)` — disposes and rebuilds a single chunk's meshes (used by SSE hot-reload)
- `reloadRegion(fresh)` — diffs and reloads changed chunks across a full region

`GameRegion` owns the `Map<string, Chunk>` and `Map<string, ChunkData>`. `Chunk` constructs 256 `CreateGround` tile meshes in a 16×16 grid, coloured from `TILE_COLORS`. `dispose()` destroys all meshes.

---

## Constants Reference (`game-client/constants.ts`)

```ts
WORLD.TILE_SIZE  = 1    // visual size of a tile in Babylon units
WORLD.CHUNK_SIZE = 16   // import from mmo-shared — must stay in sync

CHUNK_LOADING.SEED_X = 0  // player spawn chunk X
CHUNK_LOADING.SEED_Z = 0  // player spawn chunk Z

CAMERA.MIN_ZOOM            = 3
CAMERA.MAX_ZOOM            = 30
CAMERA.DEFAULT_RADIUS      = 20
CAMERA.ANGULAR_SENSIBILITY = 500
CAMERA.ORBIT_SPEED         = 0.02
CAMERA.WHEEL_PRECISION     = 30

PLAYER.SIZE       = 0.75
PLAYER.Y_OFFSET   = 0.375
PLAYER.LERP_SPEED = 0.12

MOVEMENT.BASE_SPEED      = 4
MOVEMENT.AGILITY_FACTOR  = 0.05
```

---

## Coordinate System

All game code uses world tile coordinates `(x, y, z)`:
- `x` — east/west
- `y` — floor index (integer — multi-floor support via `spatialKey`)
- `z` — north/south

Chunk coordinates are always derived: `chunkX = Math.floor(x / 16)`, `chunkZ = Math.floor(z / 16)`. They are never stored on the player or entity.

Babylon world units match tile units 1:1 (`TILE_SIZE = 1`).

---

## Babylon.js Inspector (Dev)

`@babylonjs/inspector` is installed as a direct dependency and transpiled via `transpilePackages` in `next.config.mjs` (the package ships untranspiled ESM which Next.js cannot handle otherwise). The inspector is dynamically imported in the scene setup — it is never included in production bundles.

---

## Binary Channel (Planned)

Once the encrypted channel is activated, outbound action packets use `mmo-shared` crypto:

```ts
const payload = encodeMessage([REQUEST_TYPES.MOVE, myId, tick, targetId]);
const frame   = encrypt(payload, sessionKey, nonce);
ws.send(frame);  // 10-byte ArrayBuffer
```

Inbound binary frames are decrypted with `decrypt(wire, sessionKey, nonce)`. A `null` return (HMAC mismatch) drops the frame silently with a `logger.warn`.

---

## Open Tasks

- [ ] Update `src/game-client/constants.ts` to import `CHUNK_SIZE` from `mmo-shared`
- [ ] Chunk streaming — load chunks outward from player position at runtime (spiral load pattern)
- [ ] Chunk unloading — dispose chunks beyond a max radius as the player moves
- [ ] Wire binary XOR+HMAC-2B channel for outbound action packets
- [ ] Wire `decrypt` into inbound message handler for binary game-loop frames
- [ ] Player mesh pooling — reuse `BABYLON.Mesh` objects on spawn/despawn
- [ ] `snapToTile` utility — snap click point to tile centre before sending
- [ ] HUD components: HP bar, XP per skill, inventory panel
- [ ] NPC rendering — `entities/npcs.ts` is a stub
- [ ] `ClickPacket` → `ActionPacket` canvas wiring (ground click → `sendAction`)
- [ ] Quest state machine and UI
- [ ] Combat — melee range check, attack packet, death/respawn flow
