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
 * every system together, and stores the result in GameContext.
 *
 * Called after auth + session succeed. WS connect runs in parallel —
 * the engine does not depend on the WS and the WS does not depend on
 * the engine, so both can be in-flight simultaneously.
 */
export async function bootGame(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onLoadEvent: OnLoadEvent,
): Promise<boolean> {
  onLoadEvent({ stage: "engine", detail: "Starting Babylon..." });

  const engine = new GameEngine(canvas);
  if (signal.aborted) {
    engine.dispose();
    return false;
  }

  const { scene } = engine;
  const world = new GameWorld(scene);

  onLoadEvent({ stage: "world", detail: "Fetching regions..." });
  await loadAllRegions(world, signal, onLoadEvent);
  if (signal.aborted) {
    engine.dispose();
    return false;
  }

  const camera = new GameCamera(scene);
  const players = new PlayerManager(scene, world);
  const localMesh = players.spawnLocalPlayer();
  camera.attachToMesh(localMesh);

  const keys = new KeysInput(scene, camera);
  const pointer = new PointerInput(scene, players);

  engine.startRenderLoop();

  const stopDevWatcher =
    process.env.NODE_ENV === "development" ? createDevWatcher(() => world) : null;

  setContext({ engine, world, players, camera, keys, pointer, stopDevWatcher });

  logger.game("Engine, world, and all systems ready");
  return true;
}
