import { NextRequest } from "next/server";
import { request, HttpError } from "../../../../utils/http";
import { sendOk, sendBadRequest, sendError } from "../../../../utils/response";
import { validateClientToken } from "../../../../utils/client-token";
import type { LoginRequest, AuthSuccessResponse } from "../../../../types";
import { setCookie } from "../../../../utils/cookies";

export async function POST(req: NextRequest) {
  let body: LoginRequest;
  try {
    body = await req.json();
  } catch {
    return sendBadRequest("Invalid request body");
  }

  if (!body.clientToken || !validateClientToken(body.clientToken)) {
    return sendError(403, "Invalid or expired client token");
  }

  try {
    const data = await request<AuthSuccessResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    setCookie(data);

    return sendOk({ ok: true, uuid: data.uuid, playerName: data.playerName });
  } catch (err) {
    const status = err instanceof HttpError ? (err.status ?? 502) : 502;
    const message = err instanceof Error ? err.message : "Auth service unavailable";
    return sendError(status, message);
  }
}
