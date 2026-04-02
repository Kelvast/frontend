import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { KeysInput } from "./input/keys";
import { PointerInput } from "./input/pointer";
import { logger } from "../utils/logger";
import { Region, ChunkData, Tile } from "../types";

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

async function fetchChunkTiles(
  regionId: string,
  chunkX: number,
  chunkZ: number,
): Promise<Tile[][] | null> {
  const res = await fetch(
    `/api/builder/chunk?regionId=${regionId}&chunkX=${chunkX}&chunkZ=${chunkZ}`,
  );
  if (!res.ok) return null;
  const { tiles } = await res.json();
  return tiles as Tile[][];
}

async function fetchAllRegions(): Promise<Region[]> {
  const res = await fetch("/api/builder/regions");
  if (!res.ok) return [];
  const { regions } = await res.json();

  return Promise.all(
    regions.map(async (r: { id: string; chunks: { chunkX: number; chunkZ: number }[] }) => {
      const chunkEntries = await Promise.all(
        r.chunks.map(async (c) => {
          const tiles = await fetchChunkTiles(r.id, c.chunkX, c.chunkZ);
          return [
            `${c.chunkX},${c.chunkZ}`,
            {
              chunkX: c.chunkX,
              chunkZ: c.chunkZ,
              region: r.id,
              pvp: false,
              tiles: tiles ?? [],
            } as ChunkData,
          ];
        }),
      );
      return { id: r.id, name: r.id, chunks: Object.fromEntries(chunkEntries) } as Region;
    }),
  );
}

async function loadAllRegions(world: GameWorld): Promise<void> {
  const regions = await fetchAllRegions();
  regions.forEach((r) => world.loadRegion(r));
  logger.game(`Loaded ${regions.length} region(s)`);
}

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

  await loadAllRegions(world);
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
  _watcherEs = new EventSource("/api/builder/watch");

  _watcherEs.addEventListener("chunk_changed", async (e: MessageEvent) => {
    if (!_world) return;
    const { regionId, chunkX, chunkZ } = JSON.parse(e.data) as {
      regionId: string;
      chunkX: number;
      chunkZ: number;
    };
    logger.game(`Watcher — chunk changed (${chunkX}, ${chunkZ}) in "${regionId}"`);
    const tiles = await fetchChunkTiles(regionId, chunkX, chunkZ);
    if (!tiles) return;
    const chunk: ChunkData = { chunkX, chunkZ, region: regionId, pvp: false, tiles };
    _world.reloadChunk(chunk);
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
