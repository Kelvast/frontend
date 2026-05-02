import type { LogoutSuccessMessage } from "mmo-shared";
import { logger } from "../../utils/logger";
import { useGameStore } from "../../utils/game-store";
import { disconnect } from "../client";
import { registerMessageHandler } from "../registry";

function handleLogoutSuccess(_msg: LogoutSuccessMessage): void {
  logger.ws("Logout confirmed by server");
  void useGameStore.getState().onLogout();
  disconnect();
}

registerMessageHandler<LogoutSuccessMessage>("logout_success", handleLogoutSuccess);
