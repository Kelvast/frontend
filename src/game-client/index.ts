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
 * Flow:
 *   1. authenticating — dev login or prod cookie check
 *   2. session        — POST /api/game/session (hard gate)
 *   3. parallel:
 *        a. connecting — WS opens, token sent
 *        b. engine + world boot (sequential with each other)
 *   4. player_data WS message → "connected" (handled in ws/messages/player-data.ts)
 */
export async function startGame(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onLoadEvent: OnLoadEvent,
): Promise<void> {
  if (destroyPromise) await destroyPromise;
  if (signal.aborted) return;

  onLoadEvent({ stage: "authenticating", detail: DEV_MODE ? "Logging in..." : "Verifying..." });

  const authed = DEV_MODE ? await devAuth(onLoadEvent) : await prodCredentialCheck();
  if (!authed || signal.aborted) {
    if (!signal.aborted) onLoadEvent({ stage: "error", detail: "Authentication failed" });
    return;
  }

  onLoadEvent({ stage: "session", detail: "Requesting game session..." });

  const token = await fetchSession(onLoadEvent);
  if (!token || signal.aborted) {
    if (!signal.aborted) onLoadEvent({ stage: "error", detail: "Could not create game session" });
    return;
  }

  onLoadEvent({ stage: "connecting", detail: "Opening connection..." });

  const [, engineOk] = await Promise.all([
    Promise.resolve(connectWS(token)),
    bootGame(canvas, signal, onLoadEvent),
  ]);

  if (!engineOk && !signal.aborted) {
    onLoadEvent({ stage: "error", detail: "Engine failed to start" });
  }

  logger.game("Startup complete — awaiting player_data");
}

export function destroyGame(): void {
  if (!hasContext()) return;

  logger.game("Destroying game");
  const ctx = getContext();

  ctx.stopDevWatcher?.();
  ctx.keys.dispose();
  ctx.camera.dispose();
  ctx.players.dispose();
  clearContext();

  const engine = ctx.engine;
  destroyPromise = Promise.resolve().then(() => {
    engine.dispose();
    logger.game("Engine disposed");
    destroyPromise = null;
  });
}
