import { logger } from "../utils/logger";

type MessageHandler<T> = (msg: T) => void;

const handlers = new Map<string, MessageHandler<unknown>>();

/*
 * Registers a typed handler for a server message type.
 * Called once per message file at module evaluation time as a side effect.
 * The type parameter constrains callers; the internal map is untyped for flexibility.
 */
export function registerMessageHandler<T extends { type: string }>(
  type: T["type"],
  handler: MessageHandler<T>,
): void {
  handlers.set(type, handler as MessageHandler<unknown>);
}

/*
 * Dispatches a parsed inbound message to its registered handler.
 * Called by client.ts onmessage. Unknown types log a warning and are dropped.
 */
export function dispatch(msg: { type: string }): void {
  const handler = handlers.get(msg.type);
  if (handler) {
    handler(msg);
  } else {
    logger.warn("Unhandled WS message type:", msg.type);
  }
}
