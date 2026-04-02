import { logger } from "../../utils/logger";
import { Tile } from "../../types";
import { GameWorld } from "./index";
import REGIONS from "./regions";

export function loadAllRegions(world: GameWorld): void {
  REGIONS.forEach((r) => world.loadRegion(r));
  logger.game(`Loaded ${REGIONS.length} region(s)`);
}

export async function reloadChunkFromApi(
  world: GameWorld,
  regionId: string,
  chunkX: number,
  chunkZ: number,
): Promise<void> {
  const res = await fetch(
    `/api/builder/chunk?regionId=${regionId}&chunkX=${chunkX}&chunkZ=${chunkZ}`,
  );
  if (!res.ok) {
    logger.game(`reloadChunkFromApi — failed to fetch chunk ${chunkX},${chunkZ} in "${regionId}"`);
    return;
  }
  const { tiles, pvp } = await res.json() as { tiles: Tile[][]; pvp: boolean };
  world.reloadChunk({ chunkX, chunkZ, region: regionId, pvp, tiles });
}
