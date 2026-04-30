import type { ResourceAvailableMessage } from "mmo-shared";
import { registerMessageHandler } from "../registry";

// future: Phase 3 - restore resource node to interactive state in scene
function handleResourceAvailable(_msg: ResourceAvailableMessage): void {}

registerMessageHandler<ResourceAvailableMessage>("resource_available", handleResourceAvailable);
