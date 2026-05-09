import { MSG, type ResourceAvailableMessage } from "kelvast-shared";
import { registerMessageHandler } from "../registry";

// future: Phase 3 - restore resource node to interactive state in scene
function handleResourceAvailable(_msg: ResourceAvailableMessage): void {}

registerMessageHandler<ResourceAvailableMessage>(MSG.RESOURCE_AVAILABLE, handleResourceAvailable);
