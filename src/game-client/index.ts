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
import type { AuthSuccessResponse, LoginRequest, GameSessionResponse } from "mmo-shared";

export { GameCamera } from "./camera";
export { GameEngine } from "./engine";
export { GameWorld } from "./world";
export { PlayerManager } from "./entities/players";

let _engine: GameEngine | null = null;
let _world: GameWorld | null = null;
let _stopWatcher: (() => void) | null = null;
let _destroyPromise: Promise<void> | null = null;

export async function initGame(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<boolean> {
  if (_destroyPromise) await _destroyPromise;
  if (signal.aborted) return false;

  if (_engine) {
    logger.game("initGame called but engine already running - skipping");
    return false;
  }

  logger.game("Initialising game");

  const engine = new GameEngine(canvas);
  if (signal.aborted) {
    engine.dispose();
    return false;
  }

  const scene = engine.scene;
  const world = new GameWorld(scene);

  await loadAllRegions(world, signal);
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

  logger.game("Game ready");
  return true;
}

/*
 * Resolves the game session token then opens the WS connection.
 *
 * In dev mode: auto-logs in using NEXT_PUBLIC_DEV_EMAIL and
 * NEXT_PUBLIC_DEV_PASSWORD, fetches a game session token, and connects.
 * Falls back to connecting without a token if either step fails so the
 * engine stays usable even when the auth service is down.
 *
 * In production:
 *   - Token already in store (player came from dashboard or is still in
 *     the same session): connect immediately.
 *   - No token (direct URL, bookmark, page reload): fetch a fresh one
 *     from POST /api/game/session using the authToken cookie. A 401
 *     means the cookie is gone - the player must log in again.
 */
export async function connectGame(): Promise<void> {
  if (DEV_MODE) {
    await devConnect();
    return;
  }

  const store = useGameStore.getState();
  const existing = store.gameSessionToken;

  if (existing) {
    logger.game("Session token found in store - connecting");
    connectWS(existing);
    return;
  }

  logger.game("No session token - requesting new game session");

  try {
    const res = await browserRequest<GameSessionResponse>({
      method: "POST",
      url: "/api/game/session",
    });

    if (!res.ok) {
      logger.error("Game session request failed:", res.message);
      return;
    }

    store.storeGameSession(res);
    connectWS(res.gameSessionToken);
  } catch (err) {
    if ((err as HttpError).status === 401) {
      logger.warn("Session request returned 401 - redirecting to login");
      window.location.href = "/login";
      return;
    }
    logger.error("Failed to obtain game session:", err instanceof Error ? err.message : err);
  }
}

/*
 * Dev-only auto-login flow.
 *
 * Runs the full HTTP auth + session handshake using env credentials so
 * navigating directly to /game skips the login and dashboard screens entirely.
 * Falls back to connectWS() without a token at each failure point so Babylon
 * still loads and the WS connection attempt is visible in the console.
 */
async function devConnect(): Promise<void> {
  const creds = getDevCredentials();

  if (!creds?.email || !creds?.password) {
    logger.warn("Dev mode: credentials not set - connecting without token");
    connectWS();
    return;
  }

  logger.game("Dev mode - auto-login as", creds.email);

  try {
    const clientToken = await generateClientToken();

    const loginRes = await browserRequest<AuthSuccessResponse>({
      method: "POST",
      url: "/api/auth/login",
      data: { email: creds.email, password: creds.password, clientToken } satisfies LoginRequest,
    });

    if (!loginRes.ok) {
      logger.warn("Dev auto-login failed:", loginRes.message, "- connecting without token");
      connectWS();
      return;
    }

    logger.game("Dev auto-login success - fetching game session");

    const sessionRes = await browserRequest<GameSessionResponse>({
      method: "POST",
      url: "/api/game/session",
    });

    if (!sessionRes.ok) {
      logger.warn("Dev game session failed:", sessionRes.message, "- connecting without token");
      connectWS();
      return;
    }

    useGameStore.getState().storeGameSession(sessionRes);
    logger.game("Dev connecting with token");
    connectWS(sessionRes.gameSessionToken);
  } catch (err) {
    logger.error("Dev auto-connect threw:", err instanceof Error ? err.message : err, "- connecting without token");
    connectWS();
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
