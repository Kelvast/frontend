import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { GameSessionResponse } from "mmo-shared";
import { request, HttpError } from "../../../../utils/http";
import { sendOk, sendError } from "../../../../utils/response";
import { COOKIE } from "../../../../config";

/*
 * Issues a short-lived game session token for the authenticated player.
 *
 * Called by DashboardPage when the player clicks Play. Reads the authToken
 * HttpOnly cookie set at login - the player must already be authenticated.
 * Forwards the token to the upstream auth service which validates it and
 * returns a GameSession (gameSessionToken + gameSessionExpiresAt).
 *
 * The response is held in Zustand only - never persisted to localStorage
 * or a cookie. Passed to connectWS() to open the WS connection.
 */
export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(COOKIE.AUTH_TOKEN)?.value;

  if (!authToken) {
    return sendError("Not authenticated", 401);
  }

  try {
    const data = await request<GameSessionResponse>({
      method: "POST",
      url: "/game/session",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return sendOk(data);
  } catch (err) {
    const status = (err as HttpError).status ?? 502;
    const message = err instanceof Error ? err.message : "Auth service unavailable";
    return sendError(message, status);
  }
}
