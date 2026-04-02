import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { KeysInput } from "./input/keys";
import { PointerInput } from "./input/pointer";
import { logger } from "../utils/logger";
import { DEV_MODE } from "../utils/dev";
import { loadAllRegions } from "./world/loader";
import type { InspectorToken } from "@babylonjs/inspector";

export { GameCamera } from "./camera";
export { GameEngine } from "./engine";
export { GameWorld } from "./world";
export { PlayerManager } from "./entities/players";

let _engine: GameEngine | null = null;
let _world: GameWorld | null = null;
let _canvas: HTMLCanvasElement | null = null;
let _watcherEs: EventSource | null = null;
let _inspector: InspectorToken | null = null;
let _initAbort: AbortController | null = null;

export async function initGame(canvas: HTMLCanvasElement): Promise<void> {
  if (_engine) {
    logger.game("initGame called but engine already running — skipping");
    return;
  }

  _initAbort?.abort();
  const abort = new AbortController();
  _initAbort = abort;

  _canvas = canvas;
  logger.game("Initialising game");

  const engine = new GameEngine(canvas);
  const scene = engine.scene;
  _engine = engine;

  const world = new GameWorld(scene);
  _world = world;

  // Pass signal so loadAllRegions can abandon in-flight fetches
  await loadAllRegions(world, abort.signal);

  if (abort.signal.aborted || !_engine) {
    logger.game("initGame aborted — destroyed while loading regions");
    engine.dispose();
    _engine = null;
    return;
  }

  const camera = new GameCamera(scene);
  const players = new PlayerManager(scene);
  camera.attachToMesh(players.spawnLocalPlayer());

  engine.engine.runRenderLoop(() => {
    if (!scene.isDisposed) scene.render();
  });

  new KeysInput(scene, camera);
  new PointerInput(scene, players);

  logger.game("Game ready");

  if (DEV_MODE) {
    void openInspector(scene);
    startWatcher();
  }
}

async function openInspector(scene: import("@babylonjs/core").Scene): Promise<void> {
  const { ShowInspector } = await import("@babylonjs/inspector");
  if (!_engine) return;
  _inspector = ShowInspector(scene, { layoutMode: "overlay" });
  logger.game("Babylon inspector open");
}

export function connectGame(_token?: string): void {
  logger.game("connectGame called — server connection not yet implemented");
}

export function destroyGame(): void {
  if (!_engine) return;
  _initAbort?.abort();
  _initAbort = null;
  logger.game("Destroying game");
  _inspector?.dispose();
  _inspector = null;
  _watcherEs?.close();
  _watcherEs = null;
  _engine.dispose();
  _engine = null;
  _world = null;
}

function startWatcher(): void {
  if (_watcherEs) return;
  _watcherEs = new EventSource("/api/dev/watch");

  _watcherEs.addEventListener("reload", async (e: MessageEvent) => {
    const { filename } = JSON.parse(e.data) as { filename: string };
    logger.game(`File changed: ${filename} — reloading game`);
    if (_canvas) {
      destroyGame();
      await initGame(_canvas);
    }
  });

  _watcherEs.addEventListener("error", () => {
    logger.game("Watcher disconnected — retrying in 3s");
    _watcherEs?.close();
    _watcherEs = null;
    setTimeout(startWatcher, 3000);
  });
}
