import type { ResourceDepletedMessage } from "mmo-shared";
import { registerMessageHandler } from "../registry";

// future: Phase 3 - mark resource node unclickable in scene
function handleResourceDepleted(_msg: ResourceDepletedMessage): void {}

registerMessageHandler<ResourceDepletedMessage>("resource_depleted", handleResourceDepleted);
