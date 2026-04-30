import type { ErrorMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";

function handleError(msg: ErrorMessage): void {
  logger.error("Server error:", msg.message);
}

registerMessageHandler<ErrorMessage>("error", handleError);
