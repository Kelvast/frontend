import { request } from "./http";
import { generateClientToken } from "./client-token";
import { logger } from "./logger";
import type { HttpResponse, AuthSuccessResponse } from "../types";

type AuthResponse = HttpResponse<Pick<AuthSuccessResponse, "uuid" | "playerName">>;

/*
 * Sends an auth request to a Next.js route handler.
 * Injects a fresh clientToken into every request - the route handler
 * validates it before forwarding credentials to the auth service.
 */
export async function authRequest(
  path: string,
  body: Record<string, string>,
): Promise<AuthResponse> {
  const clientToken = await generateClientToken();
  logger.auth("→", path, { ...body, password: body.password ? "[redacted]" : undefined });

  const res = await request<AuthResponse>(path, {
    method: "POST",
    body: JSON.stringify({ ...body, clientToken }),
  });

  if (res.ok) {
    logger.auth("✓", path, { uuid: res.uuid, name: res.playerName });
  } else {
    logger.auth("✗", path, { message: res.message });
  }

  return res;
}
