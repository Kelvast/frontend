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

Current active branch: `docs/readme-context` (PR #11 → `main`).

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

`initGame(canvas)` is the entry point. It is guarded — calling it twice is a no-op. It:

1. Creates `GameEngine` (Babylon Engine + Scene)
2. Creates `GameWorld` (lighting + initial chunk load)
3. Creates `GameCamera` (arc-rotate, follows local player)
4. Creates `PlayerManager` (spawns local player box mesh)
5. Attaches pointer observable for click-to-move
6. Starts the render loop — reads store, syncs player meshes, renders scene

`destroyGame()` disposes the engine and nulls all refs. Call it in the `useEffect` cleanup.

`connectGame(token?)` calls `connectWS`, which opens the WebSocket and handles auto-login in dev mode or session resume via token.

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

Local player has its own `localMesh` reference (blue box). Remote players are orange boxes. Both use `PLAYER.SIZE = 2` and `PLAYER.Y_OFFSET = 1`.

---

## World & Chunks (`game-client/world/`)

`GameWorld` owns the `Map<string, Chunk>` registry keyed by `"chunkX,chunkZ"`. On construction it calls `_setupLighting` (hemispheric ambient + directional sun) then `_loadInitialChunks`.

`Chunk` constructs 256 `CreateGround` tile meshes in a grid. Each mesh is positioned at `(worldX, tile.y, worldZ)` and coloured from `TILE_CONFIG[tile.type].color`. `dispose()` destroys all 256 meshes.

Chunk data currently lives as static TypeScript exports under `world/regions/`. The `chunk-manager` pattern (dynamic load/unload on player movement) is the target architecture — `GameWorld._loadChunk` and `_unloadChunk` are the hooks it will call.

---

## Constants Reference (`game-client/constants.ts`)

```ts
WORLD.TILE_SIZE           = 1     // visual size of a tile in Babylon units
WORLD.CHUNK_SIZE          = 16    // tiles per chunk edge

CAMERA.MIN_ZOOM           = 5
CAMERA.MAX_ZOOM           = 40
CAMERA.DEFAULT_RADIUS     = 20
CAMERA.ANGULAR_SENSIBILITY = 500
CAMERA.ORBIT_SPEED        = 0.02

PLAYER.SIZE               = 2
PLAYER.Y_OFFSET           = 1
PLAYER.LERP_SPEED         = 0.12  // per-frame lerp factor for remote player position

CHUNK_MANAGER.LOAD_RADIUS = 1     // 1 = 3×3 grid around player

MOVEMENT.TILE_DURATION_MS = 600
MOVEMENT.EASE_IN_TILES    = 2
MOVEMENT.EASE_OUT_TILES   = 1
MOVEMENT.MAX_PATH_LENGTH  = 25
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

The session key (`Buffer`, 32 bytes) comes from `LoginSuccessMsg` and is stored in the Zustand store under `sessionKey` — never persisted.

---

## Open Tasks

- [ ] Wire binary XOR+HMAC-2B channel for outbound action packets (replace `sendPlayerUpdate` JSON)
- [ ] Wire `decrypt` into inbound message handler for binary game-loop frames
- [ ] Implement `ResumePacket` auto-send on mount from stored `sessionToken`
- [ ] `ChunkManager` — dynamic load/unload on player movement (hooks exist in `GameWorld`)
- [ ] Player mesh pooling — reuse `BABYLON.Mesh` objects on spawn/despawn
- [ ] `snapToTile` utility — snap click point to tile centre before sending
- [ ] HUD components: HP bar, XP per skill, inventory panel
- [ ] NPC rendering — `entities/npcs.ts` is a stub
- [ ] Remove legacy `state` message handler once server emits `player_init` / `tick` / `player_leave`
- [ ] `ClickPacket` — wire canvas right-click / ground click to server with tile coordinates
- [ ] Quest state machine and UI
- [ ] Combat — melee range check, attack packet, death/respawn flow
