import { logger } from "../../utils/logger";
import { browserRequest, HttpError } from "../../utils/http";
import { useGameStore } from "../../utils/game-store";
import type { GameSessionResponse } from "kelvast-shared";
import type { OnLoadEvent } from "../../types/loading";

/*
 * POST /api/game/session — the hard gate between auth and everything else.
 * Returns the session token string on success, null on any failure.
 * A 401 redirects to /login. Skips the fetch if a token is already in store.
 */
export async function fetchSession(onLoadEvent: OnLoadEvent): Promise<string | null> {
  const existing = useGameStore.getState().gameSessionToken;
  if (existing) {
    logger.game("session: token already in store — skipping fetch");
    onLoadEvent({ stage: "session", detail: "Session restored" });
    return existing;
  }

  logger.http("▶ POST /api/game/session");

  try {
    const res = await browserRequest<GameSessionResponse>({
      method: "POST",
      url: "/api/game/session",
    });

    if (!res.ok) {
      logger.error("session: request failed:", res.message);
      return null;
    }

    useGameStore.getState().storeGameSession(res);
    onLoadEvent({ stage: "session", detail: "Session created" });
    logger.http("✓ POST /api/game/session — expires:", res.gameSessionExpiresAt);
    return res.gameSessionToken;
  } catch (err) {
    if ((err as HttpError).status === 401) {
      logger.warn("session: 401 — redirecting to /login");
      window.location.href = "/login";
      return null;
    }
    logger.error("session threw:", err instanceof Error ? err.message : err);
    return null;
  }
}
