import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { KeysInput } from "./input/keys";
import { PointerInput } from "./input/pointer";
import { logger } from "../utils/logger";
import { loadAllRegions } from "./world/loader";
import { createDevWatcher } from "./dev-watcher";

export { GameCamera } from "./camera";
export { GameEngine } from "./engine";
export { GameWorld } from "./world";
export { PlayerManager } from "./entities/players";

let _engine: GameEngine | null = null;
let _world: GameWorld | null = null;
let _stopWatcher: (() => void) | null = null;
let _destroyPromise: Promise<void> | null = null;

export async function initGame(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<boolean> {
  if (_destroyPromise) await _destroyPromise;
  if (signal.aborted) return false;

  if (_engine) {
    logger.game("initGame called but engine already running — skipping");
    return false;
  }

  logger.game("Initialising game");

  const engine = new GameEngine(canvas);
  if (signal.aborted) {
    engine.dispose();
    return false;
  }

  const scene = engine.scene;
  const world = new GameWorld(scene);

  await loadAllRegions(world, signal);
  if (signal.aborted) {
    engine.dispose();
    return false;
  }

  _engine = engine;
  _world = world;

  const camera = new GameCamera(scene);
  const players = new PlayerManager(scene, world);
  const localMesh = players.spawnLocalPlayer();
  camera.attachToMesh(localMesh);

  new KeysInput(scene, camera);
  new PointerInput(scene, players);

  _engine.engine.runRenderLoop(() => scene.render());

  if (process.env.NODE_ENV === "development") {
    _stopWatcher = createDevWatcher(() => _world);
  }

  logger.game("Game ready");
  return true;
}

export function connectGame(_token?: string): void {
  logger.game("connectGame called — server connection not yet implemented");
}

export function destroyGame(): void {
  if (!_engine) return;

  logger.game("Destroying game");
  _stopWatcher?.();
  _stopWatcher = null;

  const engine = _engine;
  _engine = null;
  _world = null;

  _destroyPromise = Promise.resolve().then(() => {
    engine.dispose();
    logger.game("Engine disposed");
    _destroyPromise = null;
  });
}
