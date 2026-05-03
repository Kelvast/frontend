import { logger } from "../../utils/logger";
import { browserRequest } from "../../utils/http";
import { generateClientToken } from "../../utils/client-token";
import { useGameStore } from "../../utils/game-store";
import { getDevCredentials } from "../../utils/dev";
import type { AuthSuccessResponse, LoginRequest, AuthResponse } from "mmo-shared";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * Dev auth: POST /api/auth/login using NEXT_PUBLIC_DEV_EMAIL + NEXT_PUBLIC_DEV_PASSWORD.
 * Stores identity in the game store so the session route can use it.
 * Does not fetch the session token — that is fetchSession()'s responsibility.
 */
export async function devAuth(onLoadEvent: OnLoadEvent): Promise<boolean> {
  const creds = getDevCredentials();
  if (!creds?.email || !creds?.password) {
    logger.warn("Dev mode: DEV_EMAIL or DEV_PASSWORD not set in env");
    return false;
  }

  logger.game("Dev auth — logging in as", creds.email);

  try {
    const clientToken = await generateClientToken();
    const res = await browserRequest<AuthResponse>({
      method: "POST",
      url: "/api/auth/login",
      data: { email: creds.email, password: creds.password, clientToken } satisfies LoginRequest,
    });

    if (!res.ok) {
      logger.warn("Dev login failed:", res.message);
      return false;
    }

    const success = res as AuthSuccessResponse;
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
 * Prod auth: the authToken cookie is the credential and cannot be read
 * client-side. We optimistically proceed — fetchSession() will 401 and
 * redirect to /login if the cookie is missing or expired.
 */
export async function prodCredentialCheck(): Promise<boolean> {
  return true;
}
