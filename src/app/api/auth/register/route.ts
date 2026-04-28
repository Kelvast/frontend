import { NextRequest } from "next/server";
import type { RegisterRequest, AuthSuccessResponse } from "mmo-shared";
import { request, HttpError } from "../../../../utils/http";
import { sendOk, sendError } from "../../../../utils/response";
import { validateClientToken } from "../../../../utils/client-token";

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
      data: { name: body.name, email: body.email, password: body.password },
    });
    return sendOk(data);
  } catch (err) {
    const status = (err as HttpError).status ?? 502;
    const message = err instanceof Error ? err.message : "Auth service unavailable";
    return sendError(message, status);
  }
}
