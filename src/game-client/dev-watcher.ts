import { logger } from "../utils/logger";
import { reloadChunkFromApi } from "./world/loader";
import { GameWorld } from "./world";

const MAX_RETRIES = 5;
const RETRY_BASE_MS = 3000;

/**
 * Starts an SSE connection to the dev watch endpoint.
 * Listens for chunk_changed events and hot-reloads the affected chunk in-scene.
 * Returns a teardown function — call it in destroyGame to close the connection cleanly.
 *
 * Only used in development — guard with process.env.NODE_ENV === "development" at call site.
 */
export function createDevWatcher(getWorld: () => GameWorld | null): () => void {
  let es: EventSource | null = null;
  let retryCount = 0;

  function start(): void {
    if (es) return;
    es = new EventSource("/api/dev/watch");

    es.addEventListener("open", () => {
      retryCount = 0;
      logger.game("Watcher connected");
    });

    es.addEventListener("chunk_changed", async (e: MessageEvent) => {
      const world = getWorld();
      if (!world) return;
      const { regionId, chunkX, chunkZ } = JSON.parse(e.data) as {
        regionId: string;
        chunkX: number;
        chunkZ: number;
      };
      logger.game(`Watcher — chunk changed (${chunkX}, ${chunkZ}) in "${regionId}"`);
      await reloadChunkFromApi(world, regionId, chunkX, chunkZ);
    });

    es.addEventListener("error", () => {
      es?.close();
      es = null;
      if (retryCount >= MAX_RETRIES) {
        logger.game("Watcher — max retries reached, giving up");
        return;
      }
      const delay = RETRY_BASE_MS * 2 ** retryCount;
      retryCount++;
      logger.game(
        `Watcher disconnected — retrying in ${delay}ms (attempt ${retryCount}/${MAX_RETRIES})`,
      );
      setTimeout(start, delay);
    });
  }

  function stop(): void {
    es?.close();
    es = null;
    retryCount = 0;
  }

  start();
  return stop;
}
