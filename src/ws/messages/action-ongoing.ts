import { MSG, type ActionOngoingMessage } from "mmo-shared";
import { registerMessageHandler } from "../registry";

// future: Phase 3 - continue gather animation without state change
function handleActionOngoing(_msg: ActionOngoingMessage): void {}

registerMessageHandler<ActionOngoingMessage>(MSG.ACTION_ONGOING, handleActionOngoing);
