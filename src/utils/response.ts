import { NextResponse } from "next/server";

/*
 * Sends a successful JSON response.
 */
export function sendOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/*
 * Sends a custom error response. Pass an explicit status to override 500.
 * Use this for all error cases - covers 400, 401, 404, 500, and proxied
 * upstream errors (502, 503). Replaces sendBadRequest and sendUnauthorized
 * which were thin wrappers over the same call.
 */
export function sendError(message = "Internal Server Error", status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/*
 * Sends a 405 Method Not Allowed response with the correct Allow header.
 */
export function sendMethodNotAllowed(allowed: string[] = ["GET"]) {
  return NextResponse.json(
    { error: `Method not allowed. Allowed: ${allowed.join(", ")}` },
    { status: 405, headers: { Allow: allowed.join(", ") } },
  );
}

/*
 * Sends a 404 Not Found response.
 */
export function sendNotFound(message = "Not Found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
