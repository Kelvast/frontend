import { MSG, type ActionFinishedMessage } from "mmo-shared";
import { registerMessageHandler } from "../registry";

// future: Phase 3 - apply reward to inventory + XP, clear action state
function handleActionFinished(_msg: ActionFinishedMessage): void {}

registerMessageHandler<ActionFinishedMessage>(MSG.ACTION_FINISHED, handleActionFinished);
