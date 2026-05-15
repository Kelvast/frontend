/**
 * Centralises all environment variables and config constants.
 *
 * - NEXT_PUBLIC_* variables are bundled into the browser - never put secrets here.
 * - Non-NEXT_PUBLIC_* variables are server-only and never sent to the browser.
 * - The non-null assertion (!) causes a fast failure at startup if a required variable is missing.
 */

/** Base URL for the upstream Lambda API. Server-only - never referenced in client code. */
export const API_URL: string = process.env.API_URL!;

/** Enables dev mode when "true" - verbose logging. */
export const NEXT_PUBLIC_DEV_MODE: boolean = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export const ROUTE = {
  HOME: "/",
} as const;

export const COOKIE = {
  AUTH_TOKEN: "mmo_auth_token",
} as const;
