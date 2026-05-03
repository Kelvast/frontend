import { logger } from "../utils/logger";
import { connectWS } from "../ws";
import { DEV_MODE } from "../utils/dev";
import { devAuth, prodCredentialCheck } from "./startup/auth";
import { fetchSession } from "./startup/session";
import { bootGame } from "./startup/init";
import { getContext, hasContext, clearContext } from "./context";
import type { OnLoadEvent } from "../types/mmo/loading";

export { GameEngine } from "./engine/engine";
export { GameWorld } from "./world";

let destroyPromise: Promise<void> | null = null;

/*
 * startGame is the single entry point for the game.
 *
 * Loader stage flow:
 *   authenticating  — dev login or prod cookie check
 *   session         — POST /api/game/session
 *   connecting      — WS opens, token sent (runs in parallel with engine boot)
 *   engine          — Babylon engine + scene created
 *   world           — regions + chunks fetched and spawned
 *   player_data     — camera, player, and systems ready
 *   connected       — render loop running, scene is visible
 *
 * WS connect and engine boot are parallel. "connected" fires only after
 * both have completed so the loader dismisses onto a rendered scene.
 */
export async function startGame(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onLoadEvent: OnLoadEvent,
): Promise<void> {
  if (destroyPromise) await destroyPromise;
  if (signal.aborted) return;

  logger.game("▶ startGame");
  onLoadEvent({
    stage: "authenticating",
    detail: DEV_MODE ? "Dev login..." : "Verifying session...",
  });

  logger.game("▶ auth");
  const authed = DEV_MODE ? await devAuth(onLoadEvent) : await prodCredentialCheck();
  if (!authed || signal.aborted) {
    if (!signal.aborted) onLoadEvent({ stage: "error", detail: "Authentication failed" });
    logger.game("✗ auth failed");
    return;
  }
  logger.game("✓ auth");

  onLoadEvent({ stage: "session", detail: "Requesting game session..." });
  logger.game("▶ session");
  const token = await fetchSession(onLoadEvent);
  if (!token || signal.aborted) {
    if (!signal.aborted) onLoadEvent({ stage: "error", detail: "Could not create game session" });
    logger.game("✗ session failed");
    return;
  }
  logger.game("✓ session");

  onLoadEvent({ stage: "connecting", detail: "Opening connection..." });
  logger.game("▶ WS + engine boot (parallel)");

  const [, engineOk] = await Promise.all([
    Promise.resolve(connectWS(token)),
    bootGame(canvas, signal, onLoadEvent),
  ]);

  if (signal.aborted) return;

  if (!engineOk) {
    onLoadEvent({ stage: "error", detail: "Engine failed to start" });
    logger.game("✗ engine boot failed");
    return;
  }

  logger.game("✓ WS + engine boot");

  onLoadEvent({ stage: "player_data", detail: "Spawning player..." });
  onLoadEvent({ stage: "connected" });
  logger.game("✓ startGame — scene live");
}

export function destroyGame(): void {
  if (!hasContext()) return;

  logger.game("▶ destroyGame");
  const ctx = getContext();

  ctx.stopDevWatcher?.();
  ctx.keys.dispose();
  ctx.camera.dispose();
  ctx.players.dispose();
  clearContext();

  const engine = ctx.engine;
  destroyPromise = Promise.resolve().then(() => {
    engine.dispose();
    logger.game("✓ destroyGame");
    destroyPromise = null;
  });
}
