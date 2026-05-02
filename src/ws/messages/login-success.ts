import type { LoginSuccessMessage } from "mmo-shared";
import { useGameStore } from "../../utils/game-store";
import { registerMessageHandler } from "../registry";

function handleLoginSuccess(msg: LoginSuccessMessage): void {
  useGameStore.getState().onLoginSuccess(msg);
}

registerMessageHandler<LoginSuccessMessage>("login_success", handleLoginSuccess);
