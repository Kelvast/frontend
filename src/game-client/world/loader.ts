import { Region, ChunkData, TileData } from "mmo-shared";
import { logger } from "../../utils/logger";
import { GameWorld } from "./index";

async function fetchChunkTiles(
  regionId: string,
  chunkX: number,
  chunkZ: number,
  signal: AbortSignal,
): Promise<TileData[][] | null> {
  const res = await fetch(
    `/api/builder/chunk?regionId=${regionId}&chunkX=${chunkX}&chunkZ=${chunkZ}`,
    { signal },
  );
  if (!res.ok) return null;
  const { tiles } = await res.json() as { tiles: TileData[][] };
  return tiles;
}

async function fetchAllRegions(signal: AbortSignal): Promise<Region[]> {
  const res = await fetch("/api/builder/regions", { signal });
  if (!res.ok) return [];
  const { regions } = await res.json() as {
    regions: { id: string; chunks: { chunkX: number; chunkZ: number }[] }[];
  };

  return Promise.all(
    regions.map(async (r) => {
      const chunkEntries = await Promise.all(
        r.chunks.map(async (c) => {
          const tiles = await fetchChunkTiles(r.id, c.chunkX, c.chunkZ, signal);
          const chunk: ChunkData = {
            chunkX: c.chunkX,
            chunkZ: c.chunkZ,
            region: r.id,
            pvp: false,
            tiles: tiles ?? [],
          };
          return [`${c.chunkX},${c.chunkZ}`, chunk] as const;
        }),
      );
      return { id: r.id, name: r.id, chunks: Object.fromEntries(chunkEntries) } as Region;
    }),
  );
}

export async function loadAllRegions(world: GameWorld, signal: AbortSignal): Promise<void> {
  try {
    const regions = await fetchAllRegions(signal);
    if (signal.aborted) return;
    regions.forEach((r) => world.loadRegion(r));
    logger.game(`Loaded ${regions.length} region(s)`);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    throw err;
  }
}

export async function reloadChunkFromApi(
  world: GameWorld,
  regionId: string,
  chunkX: number,
  chunkZ: number,
): Promise<void> {
  const controller = new AbortController();
  const tiles = await fetchChunkTiles(regionId, chunkX, chunkZ, controller.signal);
  if (!tiles) {
    logger.game(`reloadChunkFromApi — failed to fetch chunk ${chunkX},${chunkZ} in "${regionId}"`);
    return;
  }
  world.reloadChunk({ chunkX, chunkZ, region: regionId, pvp: false, tiles });
}
