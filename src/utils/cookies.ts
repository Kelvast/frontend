import { cookies } from "next/headers";
import { COOKIE } from "../config";
import { AuthSession } from "../types";

export const setCookie = async (data: AuthSession) => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE.AUTH_TOKEN, data.authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor((data.authExpiresAt - Date.now()) / 1000),
  });
};
