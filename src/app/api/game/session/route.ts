import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { GameSession } from "mmo-shared";
import { request, HttpError } from "../../../../utils/http";
import { sendOk, sendError } from "../../../../utils/response";
import { COOKIE } from "../../../../config";

/*
 * POST /api/game/session
 *
 * Validates the player's authToken cookie with the upstream API and returns a
 * short-lived gameSessionToken for opening a WebSocket connection.
 *
 * The authToken cookie is HttpOnly and never readable by the browser. This
 * route acts as the secure bridge - the browser posts here, we forward the
 * cookie value server-side, and return only the game session payload.
 *
 * On success: { ok: true, gameSessionToken, gameSessionExpiresAt }
 * On failure: { ok: false, message }
 */
export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(COOKIE.AUTH_TOKEN)?.value;

  if (!authToken) {
    return sendError("Not authenticated", 401);
  }

  try {
    const data = await request<GameSession>({
      method: "POST",
      url: "/game/session",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    return sendOk({
      ok: true,
      gameSessionToken: data.gameSessionToken,
      gameSessionExpiresAt: data.gameSessionExpiresAt,
    });
  } catch (err) {
    const status = (err as HttpError).status ?? 502;
    const message = err instanceof Error ? err.message : "Game session unavailable";

    if (status === 401) {
      return sendError("Session expired, please log in again", 401);
    }

    return sendError(message, status);
  }
}
