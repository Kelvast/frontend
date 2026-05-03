"use client";

// Registers all inbound message handlers as a module-level side effect.
// Must be imported before connectWS is called.
import "./messages/index";

export { connectWS, disconnect } from "./client";
export { sendPlayerMove } from "./messages/move";
export { sendAction } from "./messages/action";
export { sendActionStart } from "./messages/action-start";
