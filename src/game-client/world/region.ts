import { Scene, HighlightLayer } from "@babylonjs/core";
import { Region, ChunkData, TileData, WORLD } from "mmo-shared";
import { Chunk } from "./chunk";
import { logger } from "../../utils/logger";

export class GameRegion {
  private chunks: Map<string, Chunk> = new Map();
  private rawData: Map<string, ChunkData> = new Map();
  private data: Region;

  /*
   * Flat map of every tile in the region keyed by "tileX,tileZ".
   * Built once from all chunk data before any Chunk instances are created so
   * tile-mesh corner averaging can cross chunk boundaries without any per-chunk
   * neighbour lookup logic.
   */
  private tileMap: Map<string, TileData> = new Map();

  constructor(
    data: Region,
    private scene: Scene,
    private highlightLayer?: HighlightLayer,
  ) {
    this.data = data;
    logger.game(`Loading region "${data.name}" (${Object.keys(data.chunks).length} chunks)`);

    Object.values(data.chunks).forEach((chunkData) => {
      this.indexChunkTiles(chunkData);
      this.rawData.set(`${chunkData.chunkX},${chunkData.chunkZ}`, chunkData);
    });

    const getRegionTile = this.getRegionTile.bind(this);

    Object.entries(data.chunks).forEach(([key, chunkData]) => {
      this.chunks.set(key, new Chunk(chunkData, scene, getRegionTile, highlightLayer));
    });

    logger.game(`Region "${data.name}" ready`);
  }

  /*
   * Writes all tiles from a chunk into the flat tileMap using absolute tile coords.
   */
  private indexChunkTiles(chunkData: ChunkData): void {
    const { chunkX, chunkZ, tiles } = chunkData;
    const size = WORLD.CHUNK_SIZE;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const tileX = chunkX * size + col;
        const tileZ = chunkZ * size + row;
        this.tileMap.set(`${tileX},${tileZ}`, tiles[row][col]);
      }
    }
  }

  private getRegionTile(tileX: number, tileZ: number): TileData | null {
    return this.tileMap.get(`${tileX},${tileZ}`) ?? null;
  }

  getTileAt(tileX: number, tileZ: number): TileData | null {
    return this.getRegionTile(tileX, tileZ);
  }

  private hasChanged(key: string, fresh: ChunkData): boolean {
    const current = this.rawData.get(key);
    if (!current) return true;
    return (
      JSON.stringify(current.tiles) !== JSON.stringify(fresh.tiles) || current.pvp !== fresh.pvp
    );
  }

  reloadChunk(key: string, chunkData: ChunkData): void {
    const existing = this.chunks.get(key);
    if (existing) {
      existing.dispose();
      this.chunks.delete(key);
    }
    this.indexChunkTiles(chunkData);
    this.rawData.set(key, chunkData);
    this.chunks.set(
      key,
      new Chunk(chunkData, this.scene, this.getRegionTile.bind(this), this.highlightLayer),
    );
    logger.game(`HMR - chunk ${key} reloaded in "${this.data.name}"`);
  }

  reloadAll(fresh: Region): void {
    const freshKeys = new Set(Object.keys(fresh.chunks));

    Object.values(fresh.chunks).forEach((chunkData) => {
      this.indexChunkTiles(chunkData);
    });

    Object.entries(fresh.chunks).forEach(([key, chunkData]) => {
      if (this.hasChanged(key, chunkData)) {
        this.reloadChunk(key, chunkData);
      }
    });

    this.chunks.forEach((chunk, key) => {
      if (!freshKeys.has(key)) {
        chunk.dispose();
        this.chunks.delete(key);
        this.rawData.delete(key);
        logger.game(`HMR - chunk ${key} removed from "${fresh.name}"`);
      }
    });

    this.data = fresh;
  }

  dispose(): void {
    logger.game(`Disposing region "${this.data.name}"`);
    this.chunks.forEach((chunk) => chunk.dispose());
    this.chunks.clear();
    this.rawData.clear();
    this.tileMap.clear();
  }
}
