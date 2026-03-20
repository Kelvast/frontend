import { Scene, HemisphericLight, Vector3, DirectionalLight, Color3 } from "@babylonjs/core";
import { Chunk } from "./chunk";
import { logger } from "../../utils/logger";
import type { ChunkData } from "../../types";

export class GameWorld {
  private chunks: Map<string, Chunk> = new Map();

  constructor(private scene: Scene) {
    logger.game("Initialising world");
    this._setupLighting();
    logger.game("World ready");
  }

  private _setupLighting() {
    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.6;
    ambient.diffuse = new Color3(1, 1, 1);
    ambient.groundColor = new Color3(0.3, 0.3, 0.3);

    const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), this.scene);
    sun.intensity = 0.8;
    sun.diffuse = new Color3(1, 0.95, 0.8);
    logger.game("Lighting set up");
  }

  loadChunk(data: ChunkData) {
    const key = `${data.chunkX},${data.chunkZ}`;
    if (this.chunks.has(key)) {
      logger.warn(`Chunk ${key} already loaded — skipping`);
      return;
    }
    this.chunks.set(key, new Chunk(data, this.scene));
    logger.game(`Chunk ${key} loaded — total loaded: ${this.chunks.size}`);
  }

  reloadChunk(data: ChunkData) {
    const key = `${data.chunkX},${data.chunkZ}`;
    const existing = this.chunks.get(key);
    if (existing) {
      existing.dispose();
      this.chunks.delete(key);
    }
    this.chunks.set(key, new Chunk(data, this.scene));
    logger.game(`Chunk ${key} reloaded`);
  }

  dispose() {
    logger.game("Disposing world");
    this.chunks.forEach((chunk) => chunk.dispose());
    this.chunks.clear();
  }
}
