import { GameEngine } from "../engine/engine";
import { GameWorld } from "../world";
import { PlayerManager } from "../entities/players";
import { GameCamera } from "../systems/camera";
import { KeysInput } from "../systems/input-keys";
import { PointerInput } from "../systems/input-pointer";
import { loadAllRegions } from "../world/loader";
import { createDevWatcher } from "../dev-watcher";
import { setContext } from "../context";
import { logger } from "../../utils/logger";
import type { OnLoadEvent } from "../../types/mmo/loading";

/*
 * bootGame creates the Babylon engine, loads all world regions, wires
 * every system, and stores the result in GameContext.
 *
 * Each step emits a load event so the loader reflects real progress.
 * "connected" is fired by index.ts after this resolves.
 */
export async function bootGame(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onLoadEvent: OnLoadEvent,
): Promise<boolean> {
  onLoadEvent({ stage: "engine", detail: "Starting Babylon..." });
  logger.game("▶ engine");
  const engine = new GameEngine(canvas);
  if (signal.aborted) { engine.dispose(); return false; }
  logger.game("✓ engine");

  const { scene } = engine;

  logger.game("▶ world");
  onLoadEvent({ stage: "world", detail: "Fetching regions..." });
  const world = new GameWorld(scene);
  await loadAllRegions(world, signal, onLoadEvent);
  if (signal.aborted) { engine.dispose(); return false; }
  logger.game("✓ world");

  onLoadEvent({ stage: "player_data", detail: "Setting up camera..." });
  logger.game("▶ camera");
  const camera = new GameCamera(scene);
  logger.game("✓ camera");

  onLoadEvent({ stage: "player_data", detail: "Spawning local player..." });
  logger.game("▶ players");
  const players = new PlayerManager(scene, world);
  const localMesh = players.spawnLocalPlayer();
  camera.attachToMesh(localMesh);
  logger.game("✓ players");

  onLoadEvent({ stage: "player_data", detail: "Initialising input..." });
  logger.game("▶ input");
  const keys = new KeysInput(scene, camera);
  const pointer = new PointerInput(scene, players);
  logger.game("✓ input");

  logger.game("▶ render loop");
  engine.startRenderLoop();
  logger.game("✓ render loop");

  const stopDevWatcher =
    process.env.NODE_ENV === "development" ? createDevWatcher(() => world) : null;

  setContext({ engine, world, players, camera, keys, pointer, stopDevWatcher });
  return true;
}
