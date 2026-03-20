import { NextResponse } from "next/server";

/**
 * Sends a successful JSON response.
 * @param data - The payload to send as JSON.
 * @param status - HTTP status code (default: 200).
 */
export function sendOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Sends a 405 Method Not Allowed response with the correct Allow header.
 * @param allowed - Array of allowed HTTP methods (default: ["GET"]).
 */
export function sendMethodNotAllowed(allowed: string[] = ["GET"]) {
  return NextResponse.json(
    { error: `Method not allowed. Allowed: ${allowed.join(", ")}` },
    { status: 405, headers: { Allow: allowed.join(", ") } },
  );
}

/**
 * Sends a 400 Bad Request response with a custom error message.
 * @param message - Error message to send (default: "Bad Request").
 */
export function sendBadRequest(message = "Bad Request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Sends a custom error response with the given status and error message.
 * @param message - Error message (default: "Internal Server Error").
 * @param status - HTTP status code (default: 500).
 */
export function sendError(message = "Internal Server Error", status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Sends a 404 Not Found response with a custom error message.
 * @param message - Error message to send (default: "Not Found").
 */
export function sendNotFound(message = "Not Found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Sends a 401 Unauthorized response with a custom error message.
 * @param message - Error message to send (default: "Unauthorized").
 */
export function sendUnauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
