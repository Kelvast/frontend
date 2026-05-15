/**
 * Long-lived authentication session issued after login or registration.
 *
 * authToken     - opaque token set as an HttpOnly cookie by the Next.js API
 *                 route on login/register success. Never accessible to JS.
 * authExpiresAt - Unix timestamp in ms. Used to compute cookie maxAge.
 */
export interface AuthSession {
  authToken: string;
  authExpiresAt: number;
}

/**
 * Short-lived browser-generated token used for bot detection on auth routes.
 * Format: {nonce}.{timestamp}.{hash}. Validated server-side before credentials
 * are evaluated. Requests missing or failing this check are rejected with 403.
 */
export interface ClientToken {
  clientToken: string;
}

export interface EmailPassword {
  email: string;
  password: string;
}

export interface LoginRequest extends EmailPassword, ClientToken {}

export interface RegisterRequest extends EmailPassword, ClientToken {
  playerName: string;
}

/**
 * Returned by POST /api/auth/login and POST /api/auth/register on success.
 * authToken/authExpiresAt are set as an HttpOnly cookie and never reach JS.
 */
export interface AuthSuccessResponse extends AuthSession {
  uuid: string;
  playerName: string;
}

/**
 * Base shape for all HTTP error responses.
 * message is always safe to display directly to the user.
 */
export interface HttpErrorResponse {
  message: string;
}

/**
 * Discriminated union helper. Wrap a success shape with this to get
 * a typed ok/error union for any endpoint.
 *
 * Usage:
 *   export type AuthResponse = HttpResponse<AuthSuccessResponse, AuthErrorResponse>;
 */
export type HttpResponse<TSuccess, TError extends HttpErrorResponse = HttpErrorResponse> = ({ ok: true } & TSuccess) | ({ ok: false } & TError);
