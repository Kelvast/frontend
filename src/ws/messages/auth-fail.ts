import type { AuthFailMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";

function handleAuthFail(msg: AuthFailMessage): void {
  logger.error("Auth failed:", msg.message);
}

registerMessageHandler<AuthFailMessage>("auth_fail", handleAuthFail);
