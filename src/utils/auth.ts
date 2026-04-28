import type { EmailPassword, RegisterRequest, AuthResponse } from "mmo-shared";
import { request, HttpError } from "./http";
import { generateClientToken } from "./client-token";

/**
 * Sends a login request to the Next.js auth route.
 *
 * Generates a clientToken immediately before sending so it is as fresh as
 * possible. The route handler validates the token before forwarding
 * credentials to the auth service.
 *
 * @param body - Email and password credentials.
 * @returns AuthResponse — narrow on `ok` to get success or error shape.
 */
export async function loginRequest(body: EmailPassword): Promise<AuthResponse> {
  const clientToken = await generateClientToken();
  return request<AuthResponse>({
    method: "POST",
    url: "/auth/login",
    data: { ...body, clientToken },
  });
}

/**
 * Sends a register request to the Next.js auth route.
 *
 * Generates a clientToken immediately before sending so it is as fresh as
 * possible. The route handler validates the token before forwarding
 * the registration payload to the auth service.
 *
 * @param body - Name, email, and password for the new account.
 * @returns AuthResponse — narrow on `ok` to get success or error shape.
 */
export async function registerRequest(body: Omit<RegisterRequest, "clientToken">): Promise<AuthResponse> {
  const clientToken = await generateClientToken();
  return request<AuthResponse>({
    method: "POST",
    url: "/auth/register",
    data: { ...body, clientToken },
  });
}
