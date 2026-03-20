import { Scene, HemisphericLight, Vector3, DirectionalLight, Color3 } from "@babylonjs/core";
import { Chunk } from "./chunk";
import { spawnChunk1 } from "./regions/spawn/chunk-1";
import { logger } from "../../utils/logger";

export class GameWorld {
  private chunks: Map<string, Chunk> = new Map();

  constructor(private scene: Scene) {
    logger.game("Initialising world");
    this._setupLighting();
    this._loadInitialChunks();
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

  private _loadInitialChunks() {
    logger.game("Loading initial chunks");
    this._loadChunk(spawnChunk1);
  }

  private _loadChunk(data: ConstructorParameters<typeof Chunk>[0]) {
    const key = `${data.chunkX},${data.chunkZ}`;
    if (this.chunks.has(key)) {
      logger.warn(`Chunk ${key} already loaded — skipping`);
      return;
    }
    this.chunks.set(key, new Chunk(data, this.scene));
    logger.game(`Chunk ${key} loaded — total loaded: ${this.chunks.size}`);
  }

  private _unloadChunk(chunkX: number, chunkZ: number) {
    const key = `${chunkX},${chunkZ}`;
    const chunk = this.chunks.get(key);
    if (chunk) {
      chunk.dispose();
      this.chunks.delete(key);
      logger.game(`Chunk ${key} unloaded — total loaded: ${this.chunks.size}`);
    }
  }

  dispose() {
    logger.game("Disposing world");
    this.chunks.forEach((chunk) => chunk.dispose());
    this.chunks.clear();
  }
}
