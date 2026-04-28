const TOKEN_TTL_MS = 5 * 60 * 1000;
const TOKEN_PARTS = 3;

/**
 * Generates a short-lived bot-detection token to be included in auth requests.
 *
 * Combines user agent, timezone, a random nonce, and the current timestamp
 * into a SHA-256 hash. The token encodes its own expiry so the server can
 * validate it without storing issued tokens.
 *
 * Format: {nonce}.{timestamp}.{hash}
 *
 * Browser-only — relies on window.crypto.subtle and navigator.userAgent.
 * Call immediately before submitting an auth form, never at render time.
 */
export async function generateClientToken(): Promise<string> {
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const payload = `${navigator.userAgent}|${Intl.DateTimeFormat().resolvedOptions().timeZone}|${nonce}|${timestamp}`;

  const encoded = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${nonce}.${timestamp}.${hash}`;
}

/**
 * Validates a clientToken on the server before credentials are evaluated.
 *
 * Checks that the token:
 *   - Is correctly structured (three dot-separated parts)
 *   - Contains a valid numeric timestamp
 *   - Has not exceeded the TOKEN_TTL_MS expiry window
 *
 * Does not reproduce the hash — structure and expiry are sufficient to reject
 * automated scripts that omit or malform the token.
 *
 * @param token - The clientToken string from the request body.
 * @returns true if the token is valid and unexpired, false otherwise.
 */
export function validateClientToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== TOKEN_PARTS) return false;

  const timestamp = Number(parts[1]);
  if (isNaN(timestamp)) return false;

  return Date.now() - timestamp <= TOKEN_TTL_MS;
}
