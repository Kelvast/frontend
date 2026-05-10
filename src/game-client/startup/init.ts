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
import type { OnLoadEvent, LoadStage } from "../../types/loading";
import { DEV_MODE } from "../../utils/dev";
import { useGameStore } from "../../utils/game-store";

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
 * Waits for SESSION_OPENED to hydrate the store with the server-authoritative
 * spawn position. Resolves immediately if the session has already arrived,
 * otherwise subscribes and resolves on the first localPlayer write.
 * No timeout - WS connection errors are handled upstream in index.ts.
 */
function waitForSpawnCoords(): Promise<{ x: number; z: number }> {
  return new Promise((resolve) => {
    const current = useGameStore.getState().localPlayer;
    if (current) {
      resolve({ x: current.x, z: current.z });
      return;
    }
    const unsub = useGameStore.subscribe((state) => {
      if (state.localPlayer) {
        unsub();
        resolve({ x: state.localPlayer.x, z: state.localPlayer.z });
      }
    });
  });
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
 *   players     — waits for SESSION_OPENED, spawns local mesh at server coords
 *   camera      — GameCamera created and attached to local mesh
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

  /* ---- Players ---- */
  const playersStage = await runStage(
    signal,
    onLoadEvent,
    "players",
    "Spawning local player...",
    async () => {
      const players = new PlayerManager(scene, world);

      /*
       * Wait for SESSION_OPENED to fire and populate the store with the
       * server-authoritative tile coords. connectWS runs in parallel with
       * bootGame - the session may not have arrived yet by the time world
       * is ready, so we wait here rather than racing against it.
       */
      const spawnCoords = await waitForSpawnCoords();
      return { players, localMesh: players.spawnLocalPlayer(spawnCoords.x, spawnCoords.z) };
    },
  );
  if (playersStage.aborted) return abort();
  const { players, localMesh } = playersStage.result!;

  /* ---- Camera ---- */
  const cameraStage = await runStage(signal, onLoadEvent, "camera", "Setting up camera...", () => {
    const camera = new GameCamera(scene);
    camera.attachToMesh(localMesh);
    return camera;
  });
  if (cameraStage.aborted) return abort();
  const camera = cameraStage.result!;

  /* ---- Input ---- */
  const inputStage = await runStage(signal, onLoadEvent, "input", "Initialising input...", () => ({
    keys: new KeysInput(scene, camera),
    pointer: new PointerInput(scene),
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
