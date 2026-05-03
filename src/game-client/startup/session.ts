import { logger } from "../../utils/logger";
import { browserRequest, HttpError } from "../../utils/http";
import { useGameStore } from "../../utils/game-store";
import type { GameSessionResponse } from "mmo-shared";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * POST /api/game/session — the hard gate between auth and everything else.
 * Returns the session token string on success, null on any failure.
 *
 * If the store already holds a token (navigated from dashboard) the fetch
 * is skipped and the existing token is returned immediately.
 *
 * A 401 means the authToken cookie is missing or expired — redirect to login.
 */
export async function fetchSession(onLoadEvent: OnLoadEvent): Promise<string | null> {
  const existing = useGameStore.getState().gameSessionToken;
  if (existing) {
    logger.game("Session token already in store — skipping fetch");
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
      logger.warn("Session 401 — redirecting to /login");
      window.location.href = "/login";
      return null;
    }
    logger.error("Session request threw:", err instanceof Error ? err.message : err);
    return null;
  }
}
