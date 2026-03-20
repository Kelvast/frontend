import { Scene } from "@babylonjs/core";
import { Region, ChunkData } from "../../types";
import { Chunk } from "./chunk";
import { logger } from "../../utils/logger";

export class GameRegion {
  private chunks: Map<string, Chunk> = new Map();
  private rawData: Map<string, ChunkData> = new Map();
  private data: Region;

  constructor(data: Region, private scene: Scene) {
    this.data = data;
    logger.game(`Loading region "${data.name}" (${Object.keys(data.chunks).length} chunks)`);
    Object.entries(data.chunks).forEach(([key, chunkData]) => {
      this.chunks.set(key, new Chunk(chunkData, scene));
      this.rawData.set(key, chunkData);
    });
    logger.game(`Region "${data.name}" ready`);
  }

  private hasChanged(key: string, fresh: ChunkData): boolean {
    const current = this.rawData.get(key);
    if (!current) return true;
    return JSON.stringify(current.tiles) !== JSON.stringify(fresh.tiles) ||
      current.pvp !== fresh.pvp;
  }

  reloadChunk(key: string, chunkData: ChunkData): void {
    const existing = this.chunks.get(key);
    if (existing) {
      existing.dispose();
      this.chunks.delete(key);
    }
    this.chunks.set(key, new Chunk(chunkData, this.scene));
    this.rawData.set(key, chunkData);
    logger.game(`HMR — chunk ${key} reloaded in "${this.data.name}"`);
  }

  reloadAll(fresh: Region): void {
    const freshKeys = new Set(Object.keys(fresh.chunks));

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
        logger.game(`HMR — chunk ${key} removed from "${fresh.name}"`);
      }
    });

    this.data = fresh;
  }

  dispose(): void {
    logger.game(`Disposing region "${this.data.name}"`);
    this.chunks.forEach((chunk) => chunk.dispose());
    this.chunks.clear();
    this.rawData.clear();
  }
}
