const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export const logger = {
  log: (...args: unknown[]) => isDev && console.log("[MMO]", ...args),
  warn: (...args: unknown[]) => isDev && console.warn("[MMO]", ...args),
  error: (...args: unknown[]) => console.error("[MMO]", ...args),
  ws: (...args: unknown[]) => isDev && console.log("[WS]", ...args),
  game: (...args: unknown[]) => isDev && console.log("[GAME]", ...args),
} as const;
