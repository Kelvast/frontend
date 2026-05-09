import { MSG, type SessionRejectedMessage } from "kelvast-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";

/*
 * Handles SESSION_REJECTED (102).
 *
 * Sent when the server rejects the SESSION_RESUME packet.
 * Reasons: token missing, malformed, expired, or player already connected.
 *
 * Redirects to /login. The message text is logged for debugging but not
 * surfaced as a UI toast - the login page handles its own error state.
 */
function handleSessionRejected(msg: SessionRejectedMessage): void {
  logger.error("Session rejected:", msg.message);
  // Redirect outside React tree - avoids needing a router reference here.
  window.location.href = "/login";
}

registerMessageHandler<SessionRejectedMessage>(MSG.SESSION_REJECTED, handleSessionRejected);
