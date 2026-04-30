"use client";

// Registers all inbound message handlers as a module-level side effect.
// Must be imported before connectWS is called.
import "./messages/index";

export { connectWS, disconnect } from "./client";
export { sendPlayerMove } from "./packets/move";
export { sendPing } from "./packets/ping";
export { sendLogout } from "./packets/logout";
export { sendAction } from "./packets/action";
export { sendActionStart } from "./packets/action-start";
export { sendSettings } from "./packets/settings";
