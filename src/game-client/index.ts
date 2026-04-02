import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { KeysInput } from "./input/keys";
import { PointerInput } from "./input/pointer";
import { logger } from "../utils/logger";
import { loadAllRegions, reloadChunkFromApi } from "./world/loader";

export { GameCamera } from "./camera";
export { GameEngine } from "./engine";
export { GameWorld } from "./world";
export { PlayerManager } from "./entities/players";

let _engine: GameEngine | null = null;
let _world: GameWorld | null = null;
let _watcherEs: EventSource | null = null;
let _watcherRetryCount = 0;
let _destroyPromise: Promise<void> | null = null;

const WATCHER_MAX_RETRIES = 5;
const WATCHER_RETRY_BASE_MS = 3000;

export async function initGame(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<boolean> {
  if (_destroyPromise) await _destroyPromise;

  if (signal.aborted) return false;

  if (_engine) {
    logger.game("initGame called but engine already running — skipping");
    return false;
  }

  logger.game("Initialising game");

  const engine = new GameEngine(canvas);
  if (signal.aborted) { engine.dispose(); return false; }

  const scene = engine.scene;
  const world = new GameWorld(scene);

  await loadAllRegions(world, signal);
  if (signal.aborted) { engine.dispose(); return false; }

  _engine = engine;
  _world = world;

  const camera = new GameCamera(scene);
  const players = new PlayerManager(scene);
  const localMesh = players.spawnLocalPlayer();
  camera.attachToMesh(localMesh);

  new KeysInput(scene, camera);
  new PointerInput(scene, players);

  _engine.engine.runRenderLoop(() => scene.render());

  if (process.env.NODE_ENV === "development") {
    startWatcher();
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
  _watcherEs?.close();
  _watcherEs = null;
  _watcherRetryCount = 0;

  const engine = _engine;
  _engine = null;
  _world = null;

  _destroyPromise = Promise.resolve().then(() => {
    engine.dispose();
    logger.game("Engine disposed");
    _destroyPromise = null;
  });
}

function startWatcher(): void {
  if (_watcherEs) return;
  _watcherEs = new EventSource("/api/dev/watch");

  _watcherEs.addEventListener("open", () => {
    _watcherRetryCount = 0;
    logger.game("Watcher connected");
  });

  _watcherEs.addEventListener("file_changed", (e: MessageEvent) => {
    const { filename } = JSON.parse(e.data) as { filename: string };
    logger.game(`Watcher — file changed: ${filename}`);
  });

  _watcherEs.addEventListener("chunk_changed", async (e: MessageEvent) => {
    if (!_world) return;
    const { regionId, chunkX, chunkZ } = JSON.parse(e.data) as {
      regionId: string;
      chunkX: number;
      chunkZ: number;
    };
    logger.game(`Watcher — chunk changed (${chunkX}, ${chunkZ}) in "${regionId}"`);
    await reloadChunkFromApi(_world, regionId, chunkX, chunkZ);
  });

  _watcherEs.addEventListener("error", () => {
    _watcherEs?.close();
    _watcherEs = null;

    if (_watcherRetryCount >= WATCHER_MAX_RETRIES) {
      logger.game("Watcher — max retries reached, giving up");
      return;
    }

    const delay = WATCHER_RETRY_BASE_MS * 2 ** _watcherRetryCount;
    _watcherRetryCount++;
    logger.game(`Watcher disconnected — retrying in ${delay}ms (attempt ${_watcherRetryCount}/${WATCHER_MAX_RETRIES})`);
    setTimeout(startWatcher, delay);
  });
}
