import type { AuthFailMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { disconnect } from "../client";
import { registerMessageHandler } from "../registry";

function handleAuthFail(msg: AuthFailMessage): void {
  logger.error("Auth failed:", msg.message, "- redirecting to login");
  disconnect();
  window.location.href = "/login";
}

registerMessageHandler<AuthFailMessage>("auth_fail", handleAuthFail);
