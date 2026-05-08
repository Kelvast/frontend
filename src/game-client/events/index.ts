/*
 * Public surface of the GameEventBus module.
 *
 * Import the singleton:
 *   import { gameEventBus } from 'src/game-client/events';
 *
 * Import types for handler signatures:
 *   import type { GameEventMap, GameEventKey, GameEventPayload } from 'src/game-client/events';
 */
export { gameEventBus } from './bus';
export type { GameEventMap, GameEventKey, GameEventPayload } from './types';
