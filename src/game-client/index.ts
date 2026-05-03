import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { KeysInput } from "./input/keys";
import { PointerInput } from "./input/pointer";
import { logger } from "../utils/logger";
import { loadAllRegions } from "./world/loader";
import { createDevWatcher } from "./dev-watcher";
import { connectWS } from "../ws";
import { browserRequest, HttpError } from "../utils/http";
import { generateClientToken } from "../utils/client-token";
import { useGameStore } from "../utils/game-store";
import { DEV_MODE, getDevCredentials } from "../utils/dev";
import type {
  AuthSuccessResponse,
  LoginRequest,
  GameSessionResponse,
  AuthResponse,
} from "mmo-shared";
import type { OnLoadEvent } from "../types/mmo/loading";

export { GameCamera } from "./camera";
export { GameEngine } from "./engine";
export { GameWorld } from "./world";
export { PlayerManager } from "./entities/players";

let _engine: GameEngine | null = null;
let _world: GameWorld | null = null;
let _stopWatcher: (() => void) | null = null;
let _destroyPromise: Promise<void> | null = null;

/*
 * Full startup sequence:
 *
 *   1. authenticating — credential check (dev login or prod cookie verify)
 *   2. session        — POST /api/game/session, token issued; hard gate —
 *                       nothing else starts if this fails
 *   3. parallel:
 *        connecting   — WS opens, token sent
 *        engine       — Babylon boots, scene ready
 *        world        — regions + chunks fetched and loaded
 *   4. player_data    — server sends skills/inventory → connected
 *
 * Stages 3a-3c are labelled sequentially in the UI even though they run
 * in parallel — the loader advances through connecting → engine → world
 * as each resolves, but all three are in-flight simultaneously.
 */
export async function startGame(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onLoadEvent: OnLoadEvent,
): Promise<void> {
  if (_destroyPromise) await _destroyPromise;
  if (signal.aborted) return;

  // ── 1. Auth ──────────────────────────────────────────────────────────────
  onLoadEvent({
    stage: "authenticating",
    detail: DEV_MODE ? "Logging in..." : "Verifying credentials...",
  });

  const authed = DEV_MODE ? await devAuth(onLoadEvent) : await prodCredentialCheck();
  if (!authed || signal.aborted) {
    if (!signal.aborted) onLoadEvent({ stage: "error", detail: "Authentication failed" });
    return;
  }

  // ── 2. Session (hard gate) ───────────────────────────────────────────────
  onLoadEvent({ stage: "session", detail: "Requesting game session..." });

  const token = await fetchSession(onLoadEvent);
  if (!token || signal.aborted) {
    if (!signal.aborted) onLoadEvent({ stage: "error", detail: "Could not create game session" });
    return;
  }

  // ── 3. Parallel: WS connect + engine + world ─────────────────────────────
  onLoadEvent({ stage: "connecting", detail: "Opening connection..." });

  const [, engineOk] = await Promise.all([
    // 3a — WS: fire and forget, session_opened/player_data handlers take over
    Promise.resolve(connectWS(token)),

    // 3b + 3c — engine then world (must be sequential with each other)
    (async () => {
      if (signal.aborted) return false;

      onLoadEvent({ stage: "engine", detail: "Starting Babylon..." });
      const engine = new GameEngine(canvas);
      if (signal.aborted) {
        engine.dispose();
        return false;
      }

      const scene = engine.scene;
      const world = new GameWorld(scene);

      onLoadEvent({ stage: "world", detail: "Fetching regions..." });
      await loadAllRegions(world, signal, onLoadEvent);
      if (signal.aborted) {
        engine.dispose();
        return false;
      }

      _engine = engine;
      _world = world;

      const camera = new GameCamera(scene);
      const players = new PlayerManager(scene, world);
      const localMesh = players.spawnLocalPlayer();
      camera.attachToMesh(localMesh);

      new KeysInput(scene, camera);
      new PointerInput(scene, players);

      _engine.engine.runRenderLoop(() => scene.render());

      if (process.env.NODE_ENV === "development") {
        _stopWatcher = createDevWatcher(() => _world);
      }

      logger.game("Engine and world ready");
      return true;
    })(),
  ]);

  if (!engineOk && !signal.aborted) {
    onLoadEvent({ stage: "error", detail: "Engine failed to start" });
    return;
  }

  // player_data handler fires "connected" — nothing more to do here
  logger.game("Startup complete — awaiting player_data");
}

/*
 * Dev: full login via NEXT_PUBLIC_DEV_EMAIL / NEXT_PUBLIC_DEV_PASSWORD.
 * Stores identity in the game store. Does NOT fetch the session token —
 * that happens in fetchSession() so the stage label is correct.
 */
async function devAuth(onLoadEvent: OnLoadEvent): Promise<boolean> {
  const creds = getDevCredentials();
  if (!creds?.email || !creds?.password) {
    logger.warn("Dev mode: credentials not set in env");
    return false;
  }

  logger.game("Dev auth — logging in as", creds.email);

  try {
    const clientToken = await generateClientToken();
    const loginRes = await browserRequest<AuthResponse>({
      method: "POST",
      url: "/api/auth/login",
      data: { email: creds.email, password: creds.password, clientToken } satisfies LoginRequest,
    });

    if (!loginRes.ok) {
      logger.warn("Dev login failed:", loginRes.message);
      return false;
    }

    const success = loginRes as AuthSuccessResponse;
    useGameStore.getState().storeIdentity({ uuid: success.uuid, playerName: success.playerName });
    onLoadEvent({ stage: "authenticating", detail: `Logged in as ${success.playerName}` });
    logger.game("Dev auth complete");
    return true;
  } catch (err) {
    logger.error("Dev auth threw:", err instanceof Error ? err.message : err);
    return false;
  }
}

/*
 * Prod: token already in store means the cookie is valid — no HTTP call
 * needed at this stage. The actual session fetch happens in fetchSession().
 */
async function prodCredentialCheck(): Promise<boolean> {
  // In prod the authToken cookie is the credential — if it's present the
  // session route will succeed. We have no way to verify it client-side
  // without making a round-trip, so we optimistically proceed to fetchSession
  // which will 401 and redirect if the cookie is missing or expired.
  return true;
}

/*
 * POST /api/game/session — hard gate for all three parallel tasks.
 * Returns the token string on success, null on failure.
 * If the store already has a token (came from dashboard) skips the fetch.
 */
async function fetchSession(onLoadEvent: OnLoadEvent): Promise<string | null> {
  const existing = useGameStore.getState().gameSessionToken;
  if (existing) {
    logger.game("Session token already in store");
    onLoadEvent({ stage: "session", detail: "Session restored" });
    return existing;
  }

  try {
    const res = await browserRequest<GameSessionResponse>({
      method: "POST",
      url: "/api/game/session",
    });

    if (!res.ok) {
      logger.error("Session request failed:", res.message);
      return null;
    }

    useGameStore.getState().storeGameSession(res);
    onLoadEvent({ stage: "session", detail: "Session created" });
    logger.game("Game session token acquired");
    return res.gameSessionToken;
  } catch (err) {
    if ((err as HttpError).status === 401) {
      logger.warn("Session 401 — redirecting to login");
      window.location.href = "/login";
      return null;
    }
    logger.error("Session request threw:", err instanceof Error ? err.message : err);
    return null;
  }
}

export function destroyGame(): void {
  if (!_engine) return;

  logger.game("Destroying game");
  _stopWatcher?.();
  _stopWatcher = null;

  const engine = _engine;
  _engine = null;
  _world = null;

  _destroyPromise = Promise.resolve().then(() => {
    engine.dispose();
    logger.game("Engine disposed");
    _destroyPromise = null;
  });
}
