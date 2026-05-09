import { MSG, type ErrorMessage } from "kelvast-shared";
import { logger } from "../../utils/logger";
import { registerMessageHandler } from "../registry";

function handleError(msg: ErrorMessage): void {
  logger.error("Server error:", msg.message);
}

registerMessageHandler<ErrorMessage>(MSG.ERROR, handleError);
