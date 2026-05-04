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
import type { OnLoadEvent, LoadStage } from "../../types/mmo/loading";
import { DEV_MODE } from "../../utils/dev";
import { useGameStore } from "../../utils/game-store";
import { WORLD } from "mmo-shared";

/*
 * runStage wraps each boot step with the three things every stage needs:
 *   1. emit an onLoadEvent so the loader UI advances
 *   2. log ▶ / ✓ bookends
 *   3. check the abort signal after the work completes
 *
 * Returns false if the signal was aborted, true otherwise.
 * The caller checks the return value and bails out early if needed.
 */
async function runStage<T>(
  signal: AbortSignal,
  onLoadEvent: OnLoadEvent,
  stage: LoadStage,
  detail: string,
  work: () => T | Promise<T>,
): Promise<{ aborted: boolean; result: T | null }> {
  onLoadEvent({ stage, detail });
  logger.game(`▶ ${stage}`);
  const result = await work();
  if (signal.aborted) return { aborted: true, result: null };
  logger.game(`✓ ${stage}`);
  return { aborted: false, result };
}

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
  const engine = new GameEngine(canvas);

  const abort = () => {
    engine.dispose();
    return false;
  };

  /* ---- Engine ---- */
  const engineStage = await runStage(
    signal,
    onLoadEvent,
    "engine",
    "Starting Babylon engine...",
    () => {},
  );
  if (engineStage.aborted) return abort();

  /* ---- Scene ---- */
  const sceneStage = await runStage(signal, onLoadEvent, "scene", "Building scene...", () =>
    engine.bootScene(),
  );
  if (sceneStage.aborted) return abort();

  /* ---- Assets ---- */
  const assetsStage = await runStage(signal, onLoadEvent, "assets", "Loading assets...", () =>
    engine.bootAssets(),
  );
  if (assetsStage.aborted) return abort();

  /* ---- Audio ---- */
  const audioStage = await runStage(signal, onLoadEvent, "audio", "Priming audio...", () =>
    engine.bootAudio(),
  );
  if (audioStage.aborted) return abort();

  /* ---- World ---- */
  const { scene } = engine;
  const world = new GameWorld(scene);
  const worldStage = await runStage(signal, onLoadEvent, "world", "Fetching regions...", () =>
    loadAllRegions(world, signal, onLoadEvent),
  );
  if (worldStage.aborted) return abort();

  /* ---- Camera ---- */
  const cameraStage = await runStage(
    signal,
    onLoadEvent,
    "camera",
    "Setting up camera...",
    () => new GameCamera(scene),
  );
  if (cameraStage.aborted) return abort();
  const camera = cameraStage.result!;

  /* ---- Players ---- */
  const playersStage = await runStage(
    signal,
    onLoadEvent,
    "players",
    "Spawning local player...",
    () => {
      const players = new PlayerManager(scene, world);
      const { localPlayer } = useGameStore.getState();
      const spawnTileX = localPlayer ? Math.floor(localPlayer.x / WORLD.TILE_SIZE) : 0;
      const spawnTileZ = localPlayer ? Math.floor(localPlayer.z / WORLD.TILE_SIZE) : 0;
      const localMesh = players.spawnLocalPlayer(spawnTileX, spawnTileZ);
      camera.attachToMesh(localMesh);
      return players;
    },
  );
  if (playersStage.aborted) return abort();
  const players = playersStage.result!;

  /* ---- Input ---- */
  const inputStage = await runStage(signal, onLoadEvent, "input", "Initialising input...", () => ({
    keys: new KeysInput(scene, camera),
    pointer: new PointerInput(scene, players),
  }));
  if (inputStage.aborted) return abort();
  const { keys, pointer } = inputStage.result!;

  /* ---- Render loop ---- */
  logger.game("▶ render loop");
  engine.startRenderLoop();
  logger.game("✓ render loop");

  const stopDevWatcher = DEV_MODE ? createDevWatcher(() => world) : null;

  setContext({ engine, world, players, camera, keys, pointer, stopDevWatcher });
  return true;
}
