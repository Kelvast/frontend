import { Scene } from "@babylonjs/core";
import { Region, ChunkData } from "../../types";
import { Chunk } from "./chunk";
import { logger } from "../../utils/logger";

export class GameRegion {
  private chunks: Map<string, Chunk> = new Map();
  private data: Region;

  constructor(data: Region, private scene: Scene) {
    this.data = data;
    logger.game(`Loading region "${data.name}" (${Object.keys(data.chunks).length} chunks)`);
    Object.entries(data.chunks).forEach(([key, chunkData]) => {
      this.chunks.set(key, new Chunk(chunkData, scene));
    });
    logger.game(`Region "${data.name}" ready`);
  }

  reloadChunk(key: string, chunkData: ChunkData): void {
    const existing = this.chunks.get(key);
    if (existing) {
      existing.dispose();
      this.chunks.delete(key);
    }
    this.chunks.set(key, new Chunk(chunkData, this.scene));
    logger.game(`HMR — chunk ${key} reloaded in "${this.data.name}"`);
  }

  reloadAll(fresh: Region): void {
    const freshKeys = new Set(Object.keys(fresh.chunks));
    const currentKeys = new Set(this.chunks.keys());

    Object.entries(fresh.chunks).forEach(([key, chunkData]) => {
      const current = this.chunks.get(key);
      if (!current || JSON.stringify(current) !== JSON.stringify(chunkData)) {
        this.reloadChunk(key, chunkData);
      }
    });

    currentKeys.forEach((key) => {
      if (!freshKeys.has(key)) {
        this.chunks.get(key)?.dispose();
        this.chunks.delete(key);
        logger.game(`HMR — chunk ${key} removed from "${fresh.name}"`);
      }
    });

    this.data = fresh;
  }

  dispose(): void {
    logger.game(`Disposing region "${this.data.name}"`);
    this.chunks.forEach((chunk) => chunk.dispose());
    this.chunks.clear();
  }
}
