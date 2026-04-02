import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { KeysInput } from "./input/keys";
import { PointerInput } from "./input/pointer";
import { logger } from "../utils/logger";
import { DEV_MODE } from "../utils/dev";
import { Region, ChunkData, Tile } from "../types";
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

export async function initGame(canvas: HTMLCanvasElement): Promise<void> {
  if (_engine) {
    logger.game("initGame called but engine already running — skipping");
    return;
  }

  _canvas = canvas;
  logger.game("Initialising game");

  _engine = new GameEngine(canvas);
  const scene = _engine.scene;

  _world = new GameWorld(scene);
  await loadAllRegions(_world);

  const camera = new GameCamera(scene);
  const players = new PlayerManager(scene);
  const localMesh = players.spawnLocalPlayer();
  camera.attachToMesh(localMesh);

  new KeysInput(scene, camera);
  new PointerInput(scene, players);

  _engine.engine.runRenderLoop(() => scene.render());

  if (DEV_MODE) {
    import("@babylonjs/inspector").then(({ ShowInspector }) => {
      _inspector = ShowInspector(scene);
      logger.game("Babylon inspector open");
    });
    startWatcher();
  }

  logger.game("Game ready");
}

export function connectGame(_token?: string): void {
  logger.game("connectGame called — server connection not yet implemented");
}

export function destroyGame(): void {
  if (!_engine) return;
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
