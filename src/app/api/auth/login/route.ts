import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { request, HttpError } from "../../../../utils/http";
import { sendOk, sendError } from "../../../../utils/response";
import { validateClientToken } from "../../../../utils/client-token";
import { COOKIE } from "../../../../config";
import type { LoginRequest, AuthSuccessResponse } from "../../../../types";

export async function POST(req: NextRequest) {
  let body: LoginRequest;
  try {
    body = await req.json();
  } catch {
    return sendError("Invalid request body", 400);
  }

  if (!body.clientToken || !validateClientToken(body.clientToken)) {
    return sendError("Invalid or expired client token", 403);
  }

  try {
    const data = await request<AuthSuccessResponse>({
      method: "POST",
      url: "/auth/login",
      data: { email: body.email, password: body.password },
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE.AUTH_TOKEN, data.authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.floor((data.authExpiresAt - Date.now()) / 1000),
    });

    return sendOk({ ok: true, uuid: data.uuid, playerName: data.playerName });
  } catch (err) {
    const status = (err as HttpError).status ?? 502;
    const message = err instanceof Error ? err.message : "Auth service unavailable";
    return sendError(message, status);
  }
}
