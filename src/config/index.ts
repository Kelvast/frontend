/**
 * Centralises all environment variables and config constants.
 *
 * - NEXT_PUBLIC_* variables are bundled into the browser - never put secrets here.
 * - Non-NEXT_PUBLIC_* variables are server-only and never sent to the browser.
 * - The non-null assertion (!) causes a fast failure at startup if a required variable is missing.
 */

/** WebSocket server URL. Read by the browser to open the game connection. */
export const NEXT_PUBLIC_MMO_SERVER_URL: string = process.env.NEXT_PUBLIC_MMO_SERVER_URL!;

/** Base URL for the upstream Lambda API. Server-only - never referenced in client code. */
export const NEXT_PUBLIC_API_URL: string = process.env.NEXT_PUBLIC_API_URL!;


export const ROUTE = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  GAME: "/game",
} as const;

export const COOKIE = {
  AUTH_TOKEN: "kelvast_auth_token",
} as const;
