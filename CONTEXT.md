# CONTEXT - client

> AI assistant context only. Human docs -> README.md. Task tracking -> GitHub Issues.
>
> Cross-repo architecture, protocol, type ownership, and shared conventions live in github.com/Kelvast/docs. This file contains only repo-specific rules, constraints, and gotchas.

---

## Formatting rule

Never use em dashes (-) in any file in this repo. Use a regular hyphen (-) or rewrite the sentence. This applies to all code, comments, documentation, and commit messages.

---

## Folder structure

```ts
src/
  app/
    api/
      auth/            // POST /api/auth/login, POST /api/auth/register
      builder/         // chunk CRUD, region CRUD, SSE chunk-change stream
    game/              // game page
    login/             // login page
    map-builder/       // map builder page (dev only)
  config/              // environment and config variable bindings
  game-client/         // all Babylon.js logic - no React inside here
    systems/           // one file per system - each exports initXSystem()
    ws/
      inbound/         // one file per message domain - emits bus events
      outbound/        // sendX() helpers
    events/            // GameEventBus, GAME_EVENT, emitX/onX helpers, types
    entities/          // PlayerManager
    input/             // keys, pointer
    movement/          // pathfinding, animation, speed, waypoints
    world/             // GameWorld, regions, chunks, tile config
  presentation/
    1-atoms/
    2-molecules/
    3-organisms/       // GameCanvas, LoginForm, MapBuilder
    4-layouts/
    5-pages/
  types/               // client-only types barrel - always import from here
  utils/               // store, ws-client, http, logger, settings, helpers
  scripts/
    chunk-seams/       // dev tooling for border mismatch detection and fixing
```

---

## Branch & PR Workflow

Never commit directly to main. All work goes on a feature branch created from main - prefix: `feature/`, `fix/`, `docs/`, `refactor/`. If no active branch is known, stop and ask - do not fall back to main.

Open a PR targeting main. Do not merge it - leave it for review. Always fill in the "What does this PR do?" section.

---

## React / Babylon boundary

Never manipulate Babylon meshes from a React component. Never dispatch Zustand actions from inside the Babylon render loop - use `useGameStore.getState()` for reads and only write via systems.

---

## GameEventBus - rules

**Never** write to the Zustand store directly from a WS message handler.
**Never** call a system method directly from an inbound handler.
**Never** emit to the bus from `ws/outbound/`.

The bus is a plain synchronous class - no `EventEmitter` dependency. All payload types in `GameEventMap` derive from `mmo-shared` via `Pick<>` - no inline shape duplication.

Use the named `emitX()` and `onX()` helpers from `game-client/events` - never call `gameEventBus.emit()` or `gameEventBus.on()` directly outside of `emitters.ts` and `listeners.ts`.

All event keys follow the `'domain:verb'` pattern:

- `session:*` - WS session lifecycle
- `player:*` - local player movement state
- `area:*` - world population (joins, leaves, world-state snapshot)
- `action:*` - server-driven action lifecycle
- `world:*` - resource node state
- `input:*` - normalised intent from all input devices
- `bus:error` - fired internally when any listener throws

Area population events are `area:player-joined` and `area:player-left` - **not** `player:joined` / `player:left`.

When adding a new event: add it to `GameEventMap` in `types.ts`, add a matching entry to `GAME_EVENT` in `game-event.ts`, then add `emitX` to `emitters.ts` and `onX` to `listeners.ts` in the same PR.

---

## System init pattern

Each system exports an `initXSystem()` function that subscribes to bus events and returns a teardown function:

```ts
export function initMovementSystem(): () => void {
  const unsub1 = onPlayerMoveAcked(({ path, pace }) => { ... });
  const unsub2 = onPlayerStopped(({ id, x, z }) => { ... });
  return () => { unsub1(); unsub2(); };
}
```

`bootstrapGameClient(ws)` in `src/game-client/bootstrap.ts` calls all init functions in order and returns the combined teardown. This is called from the game component's `useEffect` - the returned teardown is the cleanup function.

---

## Zustand store - who writes what

Systems write to the store. WS message handlers never write to it directly. React reads from it - never writes from inside Babylon.

| Action | Triggered by |
|---|---|
| `setMyId` | `systems/session.ts` on `session:opened` |
| `setLocalPlayer` | `systems/session.ts` on `session:opened` |
| `onPlayerData` | `systems/session.ts` on `session:player-data` - hydrates skills, inventory, equipment |
| `addNearbyPlayer` | `systems/players.ts` on `area:player-joined` |
| `removeNearbyPlayer` | `systems/players.ts` on `area:player-left` |
| `onPlayerStopped` | `systems/movement.ts` on `player:stopped` - snaps position, clears `isMoving` for local and nearby |
| `onPlayerMoveAck` | `systems/movement.ts` on `player:move-acked` - sets `isMoving: true`, does NOT update x/z |
| `onPlayerArrived` | called by `PlayerManager` when mesh reaches destination tile |
| `onTick` | `systems/movement.ts` on `player:tick` - patches `nearbyPlayers` and `localPlayer` from tick deltas |
| `updateSettings` | UI - updates a single top-level key, calls `patchSettings` |
| `onLogout` | `systems/session.ts` on `session:closed` - clears all session state |

`localPlayer.x/z` is updated by `onTick` deltas and `onPlayerArrived` - **never** set to the destination immediately on ACK.

---

## WS inbound layer (`ws/inbound/`)

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

## WS outbound layer (`ws/outbound/`)

Typed `sendX()` helpers only. No logic, no store reads, no bus emits. The `ws` instance is always passed in as a parameter - never imported as a global.

| Function | Packet |
|---|---|
| `sendPlayerMove(ws, path, pace)` | `{ type: 204, path, pace }` |
| `sendSessionResume(ws, token)` | `{ type: 100, token }` |
| `sendSessionClose(ws)` | `{ type: 103 }` |

---

## PointerInput - click handler registry

Systems register handlers at bootstrap. `PointerInput` never imports from game systems directly. The first handler to return `true` consumes the click.

| Priority | System | Condition |
|---|---|---|
| 100 | Combat | Clicked mesh is an NPC |
| 50 | Actions | Clicked mesh is a resource node |
| 10 | Ground items | Clicked mesh is a ground item |
| 0 | Movement | Default fallback |

---

## `requestMove` guards

Two guards in `movement/movement.ts` prevent duplicate move packets:

1. `isMoving` check - if `localPlayer.isMoving` is `true`, return early
2. Tick-rate gate - one `sendPlayerMove` per `TICK_INTERVAL_MS` maximum

The `isMoving` check runs first (cheaper store read). Do not remove or reorder these.

---

## PlayerManager - position only, no animation

`PlayerManager` owns mesh lifecycle (create, pool, position) only. It does not call any Babylon animation APIs - those belong to `PlayerAnimationManager` (client/85). Never add animation calls here.

Remote players are driven by tick data via `systems/players.ts` -> `PlayerManager.applyMovementDelta(delta)`.

---

## HTTP clients (`utils/http.ts`)

`httpClient` / `request` - Next.js route handlers only. `baseURL` is `API_URL` (server-only env var, never `NEXT_PUBLIC_`). Never import in browser code.

`browserClient` / `browserRequest` - client-side code calling Next.js API routes only. Never use in route handlers.

---

## Types (`src/types/`)

`src/types/ws-protocol.ts` and `src/types/mmo/skills.ts` have been removed - all WS and skill types come from `mmo-shared`.

`src/types/index.ts` is the barrel. Always import from `../../types`, not directly from sub-files.

`StoredPlayer` is never used on the client. Derived values (HP, skill levels) are always computed at render time - never stored on `PlayerState`.

---

## World & Chunks

`getNavNode(x, z)` is the single public accessor on `GameWorld` - used by `PlayerManager` and `movement/pathfinding.ts`. Do not read nav data any other way.

---

## Dev auto-login

In dev mode (`NEXT_PUBLIC_DEV_MODE === "true"`), `connectGame()` skips `POST /api/game/session`. It reads credentials via `getDevCredentials()` and opens WS directly.

---

## `mmo-shared` as a local package

Always rebuild `mmo-shared` after source changes (`npm run build`). If consuming repos behave unexpectedly after a type change, check whether `dist/` is stale.

---

## TypeScript - Node globals in scripts

`tsconfig.json` includes `"types": ["node"]`. Required for Node globals in scripts run via `tsx`. Do not remove this field.

---

## Chunk seam scripts

`scripts/chunk-seams/` - dev-only, never run in production. No confirmation prompts - all modes write immediately. Re-run `npm run seams` after any fix/ease pass to verify.
