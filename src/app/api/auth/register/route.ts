import { NextRequest } from "next/server";
import { request, HttpError } from "../../../../utils/http";
import { sendOk, sendError } from "../../../../utils/response";
import { validateClientToken } from "../../../../utils/client-token";
import type { RegisterRequest, AuthSuccessResponse } from "../../../../types";
import { setCookie } from "../../../../utils/cookies";

export async function POST(req: NextRequest) {
  let body: RegisterRequest;
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
      url: "/auth/register",
      data: { playerName: body.playerName, email: body.email, password: body.password },
    });

    setCookie(data);

    return sendOk({ ok: true, uuid: data.uuid, playerName: data.playerName });
  } catch (err) {
    const status = (err as HttpError).status ?? 502;
    const message = err instanceof Error ? err.message : "Auth service unavailable";
    return sendError(message, status);
  }
}
