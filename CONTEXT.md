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
4. Creates PlayerManager (spawns local player box mesh)
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

Single store, no slices. All WS message types imported from mmo-shared. There is no indexRegistry - the server sends a numeric id on every message and PlayerState is keyed by id directly.

hydrateLocalPlayer: called on login_success. Builds the full PlayerState from LoginSuccessMessage and upserts into nearbyPlayers. Also sets myId.

registerPlayer: called on player_join and world_state entries. Remote players seed skills/inventory/equipment with defaultSkills() / defaultInventory() / defaultEquipment() from mmo-shared.

applyTick: receives TickMessage ({ t, p: [id, x, y, z, facing, pace][] }). Builds a Map for O(1) lookup and patches matching PlayerState entries. pace at index [5] is server-resolved tiles/s - use it to drive Babylon interpolation.

updateSettings: updates a single top-level key on settings in the store. Also persists via saveSettings from utils/settings.ts.

---

## Settings (utils/settings.ts)

Persists UserSettings to localStorage under the key mmo-settings.

- loadSettings(): reads and merges with DEFAULT_SETTINGS so new keys are always present
- saveSettings(settings): writes the full settings object as JSON
- patchSettings(key, value): loads, merges a single key, saves, and returns the updated value

UserSettings and DEFAULT_SETTINGS are defined in src/types/mmo/settings.ts.

---

## WebSocket Client (utils/ws-client.ts)

Singleton - one WebSocket instance per tab. connectWS(token?) is the only entry point.

On open in dev mode (NEXT_PUBLIC_DEV_MODE === "true"): reads credentials from dev.ts and auto-sends a login packet. Otherwise: sends a resume packet with the stored token if provided.

Inbound message routing:

| data.type | Action |
|---|---|
| login_success | hydrateLocalPlayer, setSession |
| world_state | registerPlayer for each player in snapshot |
| player_join | registerPlayer |
| player_leave | unregisterPlayer(data.id) |
| player_stopped | snap position via applyTick synthetic delta |
| tick | applyTick |
| logout_success | clear session, disconnect |
| auth_fail | dev: auto-register; prod: logger.error |
| error | logger.error |
| unknown | logger.warn - never throw |

Outbound:

| Function | Packet sent |
|---|---|
| sendPlayerMove(x, y, z, pace) | { type: "move", x, y, z, pace } |
| sendSettings(settings) | { type: "save_settings", settings } |

pace is a PaceMultiplier number. Use PACE_MULTIPLIER[mode] from mmo-shared to convert a MovementType label to its numeric value before calling sendPlayerMove. facing is not a field on MovePacket - the server derives it from the movement delta.

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

PlayerManager holds a meshes map keyed by player id. Each render frame, syncPlayers(nearbyPlayers, myId) is called:

1. For each player in the store - if no mesh exists, spawnPlayer creates a box mesh; otherwise updatePlayer lerps its position
2. For each mesh key not in the store - removePlayer disposes the mesh

Local player has its own localMesh reference (blue box). Remote players are orange boxes.

---

## World & Chunks (game-client/world/)

GameWorld owns a Map of GameRegion keyed by region id. Key methods: loadRegion, loadChunk, hasChunk, reloadChunk, reloadRegion.

GameRegion owns the chunk and tile data maps. Chunk constructs 256 CreateGround tile meshes in a 16x16 grid coloured from TILE_COLORS. dispose() destroys all meshes.

---

## Babylon.js Inspector (Dev)

@babylonjs/inspector is installed as a direct dependency and transpiled via transpilePackages in next.config.mjs (the package ships untranspiled ESM which Next.js cannot handle). The inspector is dynamically imported in scene setup and is never included in production bundles.
