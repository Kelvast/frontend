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
 * bootGame drives the full client-side boot sequence and owns all
 * loader stage transitions inside the parallel boot window.
 *
 * Stage order (matches STAGES in GameLoader.tsx):
 *   engine      — Babylon Engine created
 *   scene       — Scene + lighting applied
 *   assets      — AssetsManager loaded (0 tasks today, real content later)
 *   audio       — AudioEngine primed
 *   world       — regions + chunks fetched from API and spawned
 *   camera      — GameCamera created and attached
 *   players     — local player mesh spawned
 *   input       — keyboard + pointer input initialised
 *
 * "connected" is emitted by index.ts after this resolves and the WS
 * handshake is also complete.
 */
export async function bootGame(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  onLoadEvent: OnLoadEvent,
): Promise<boolean> {
  /* ---- Engine ---- */
  onLoadEvent({ stage: "engine", detail: "Starting Babylon engine..." });
  logger.game("▶ engine");
  const engine = new GameEngine(canvas);
  if (signal.aborted) {
    engine.dispose();
    return false;
  }
  logger.game("✓ engine");

  /* ---- Scene ---- */
  onLoadEvent({ stage: "scene", detail: "Building scene..." });
  logger.game("▶ scene");
  engine.bootScene();
  if (signal.aborted) {
    engine.dispose();
    return false;
  }
  logger.game("✓ scene");

  /* ---- Assets ---- */
  onLoadEvent({ stage: "assets", detail: "Loading assets..." });
  logger.game("▶ assets");
  await engine.bootAssets();
  if (signal.aborted) {
    engine.dispose();
    return false;
  }
  logger.game("✓ assets");

  /* ---- Audio ---- */
  onLoadEvent({ stage: "audio", detail: "Priming audio..." });
  logger.game("▶ audio");
  engine.bootAudio();
  if (signal.aborted) {
    engine.dispose();
    return false;
  }
  logger.game("✓ audio");

  /* ---- World ---- */
  const { scene } = engine;
  onLoadEvent({ stage: "world", detail: "Fetching regions..." });
  logger.game("▶ world");
  const world = new GameWorld(scene);
  await loadAllRegions(world, signal, onLoadEvent);
  if (signal.aborted) {
    engine.dispose();
    return false;
  }
  logger.game("✓ world");

  /* ---- Camera ---- */
  onLoadEvent({ stage: "camera", detail: "Setting up camera..." });
  logger.game("▶ camera");
  const camera = new GameCamera(scene);
  logger.game("✓ camera");

  /* ---- Players ---- */
  onLoadEvent({ stage: "players", detail: "Spawning local player..." });
  logger.game("▶ players");
  const players = new PlayerManager(scene, world);
  const localMesh = players.spawnLocalPlayer();
  camera.attachToMesh(localMesh);
  logger.game("✓ players");

  /* ---- Input ---- */
  onLoadEvent({ stage: "input", detail: "Initialising input..." });
  logger.game("▶ input");
  const keys = new KeysInput(scene, camera);
  const pointer = new PointerInput(scene, players);
  logger.game("✓ input");

  /* ---- Render loop ---- */
  logger.game("▶ render loop");
  engine.startRenderLoop();
  logger.game("✓ render loop");

  const stopDevWatcher =
    process.env.NODE_ENV === "development" ? createDevWatcher(() => world) : null;

  setContext({ engine, world, players, camera, keys, pointer, stopDevWatcher });
  return true;
}
