# CONTEXT — mmo-client

## Branch & PR Workflow

All changes go through a feature branch and a pull request. Nothing is committed directly to `main`.

```
1. Create a feature branch from main (or the current active branch)
2. Do all work on that branch
3. Open a PR targeting main (or the relevant base branch)
4. Do NOT merge — leave it open for review and approval
5. The branch stays active until the PR is approved and merged
```

**The active branch is whichever feature branch is currently open.** There is no single long-lived development branch — each piece of work gets its own branch. When a PR is merged, that branch is done and the next task gets a new branch from the updated base.

Current active branch: `map-builder-chunk-api-later` (PR pending → `main`).

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
7. Fetches all chunk data via the builder API and loads into the world
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

The batch endpoint (`/api/builder/chunks`) is the primary load path — used by both the map builder and the game client on init. The individual chunk GET is only used by the SSE hot-reload path.

---

## Chunk Hot-Reload (Dev)

In development the game client opens a persistent SSE connection to `/api/builder/watch` after init.

- When the map builder saves a chunk (`POST /api/builder/chunk`), the route calls `notifyChunkChanged(regionId, chunkX, chunkZ)`
- This pushes a `chunk_changed` SSE event to all open connections
- The game client receives it, fetches the updated chunk via `GET /api/builder/chunk`, and calls `GameWorld.reloadChunk(chunk)`
- No page reload required — the tile meshes for that chunk are disposed and rebuilt in-place
- SSE auto-reconnects after 3s on disconnect

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

---

## Zustand Store (`utils/game-store.ts`)

Single store, no slices. Full shape:

```ts
interface GameStoreState {
  myId:             string | null
  player:           PlayerState | null
  nearbyPlayers:    PlayerState[]
  worldTime:        number
  isConnected:      boolean
  latency:          number
  sessionToken:     string | null
  sessionExpiresAt: number | null
  indexRegistry:    Map<number, string>  // session index → uuid

  setMyId:           (id: string) => void
  setConnected:      (connected: boolean) => void
  setLatency:        (latency: number) => void
  setSession:        ({ sessionToken, sessionExpiresAt }) => void
  updatePlayer:      (player: Partial<PlayerState> & { id: string }) => void
  registerPlayer:    (msg: PlayerInitMsg) => void
  unregisterPlayer:  (index: number) => void
  applyTick:         ({ t, p }) => void
}
```

### Index Registry

The `indexRegistry` is a `Map<number, string>` that translates a server-assigned session index into the player's persistent UUID. It is built as `player_init` messages arrive and entries are removed on `player_leave`. The `applyTick` action uses it to resolve delta tuples `[index, x, z, facing, hp]` back to `PlayerState` entries.

---

## WebSocket Client (`utils/ws-client.ts`)

Singleton — one `WebSocket` instance per tab. `connectWS(token?)` is the only entry point. On open:

- Dev mode (`NEXT_PUBLIC_DEV_MODE === "true"`) — reads credentials from `dev.ts` and auto-sends a `login` packet
- Otherwise — sends a `resume` packet with the stored token if provided

### Inbound message routing

| `data.type` | Action |
|---|---|
| `loginSuccess` | `setMyId`, `setSession` |
| `player_init` | `registerPlayer` |
| `player_leave` | `unregisterPlayer` |
| `tick` | `applyTick` |
| `state` | Legacy fallback — maps old broadcast to `registerPlayer` / `unregisterPlayer` |
| unknown | `logger.warn` — never throw |

The `state` handler is a **temporary compatibility shim** while the server is migrated to the `player_init` / `tick` / `player_leave` protocol. Remove it once the server emits those message types.

### Outbound

`sendPlayerUpdate(position)` sends `{ type: "player_move", position }`. This will be replaced with the binary XOR+HMAC-2B frame once the encrypted channel is wired in.

---

## Auth Flow

```
Mount → check localStorage for sessionToken
  ├─ found  → connectGame(token) → sends ResumePacket
  └─ absent → render LoginForm  → POST /api/login or /api/register
                                  → on success: store token, connectGame(token)

loginSuccess received:
  setMyId(data.id)
  setSession({ sessionToken, sessionExpiresAt })
  → transition to game view
```

The raw session key (`Buffer`, 32 bytes) is **never** written to `localStorage`. It lives only in memory for the duration of the tab session. The `sessionToken` (opaque string) is stored in `localStorage` for resume.

---

## Player Rendering (`entities/players.ts`)

`PlayerManager` holds a `meshes: Record<string, AbstractMesh>` map keyed by player UUID. Each render frame, `syncPlayers(nearbyPlayers, myId)` is called:

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

`GameRegion` owns the `Map<string, Chunk>` and `Map<string, ChunkData>`. Key methods:

- `loadChunk(key, data)` — no-op if already loaded; otherwise spawns meshes
- `reloadChunk(key, data)` — dispose + rebuild unconditionally
- `hasChunk(x, z)` — key existence check
- `reloadAll(fresh)` — diff-based reload for HMR

`Chunk` constructs 256 `CreateGround` tile meshes in a 16×16 grid, coloured from `TILE_COLORS`. `dispose()` destroys all meshes.

---

## Constants Reference (`game-client/constants.ts`)

```ts
WORLD.TILE_SIZE  = 1   // visual size of a tile in Babylon units
WORLD.CHUNK_SIZE = 16  // tiles per chunk edge

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
- `y` — height (driven by `TileHeight`)
- `z` — north/south

Chunk coordinates are always derived: `chunkX = Math.floor(x / 16)`, `chunkZ = Math.floor(z / 16)`. They are never stored on the player or entity.

Babylon world units match tile units 1:1 (`TILE_SIZE = 1`).

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

- [ ] Chunk streaming — load chunks outward from player position at runtime (spiral load pattern, `CHUNK_LOADING.SEED_X/Z` seeds the origin)
- [ ] Chunk unloading — dispose chunks beyond a max radius as the player moves
- [ ] Wire binary XOR+HMAC-2B channel for outbound action packets (replace `sendPlayerUpdate` JSON)
- [ ] Wire `decrypt` into inbound message handler for binary game-loop frames
- [ ] Implement `ResumePacket` auto-send on mount from stored `sessionToken`
- [ ] Player mesh pooling — reuse `BABYLON.Mesh` objects on spawn/despawn
- [ ] `snapToTile` utility — snap click point to tile centre before sending
- [ ] HUD components: HP bar, XP per skill, inventory panel
- [ ] NPC rendering — `entities/npcs.ts` is a stub
- [ ] Remove legacy `state` message handler once server emits `player_init` / `tick` / `player_leave`
- [ ] `ClickPacket` — wire canvas right-click / ground click to server with tile coordinates
- [ ] Quest state machine and UI
- [ ] Combat — melee range check, attack packet, death/respawn flow
