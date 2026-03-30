import {
  Scene,
  HemisphericLight,
  Vector3,
  DirectionalLight,
  Color3,
  HighlightLayer,
} from "@babylonjs/core";
import { GameRegion } from "./region";
import { logger } from "../../utils/logger";
import { Region, ChunkData } from "../../types";
import { DEV_MODE } from "../../utils/dev";

export class GameWorld {
  private regions: Map<string, GameRegion> = new Map();
  private highlightLayer: HighlightLayer | undefined;

  constructor(private scene: Scene) {
    logger.game("Initialising world");
    if (DEV_MODE) {
      this.highlightLayer = new HighlightLayer("tileHighlight", scene);
      this.highlightLayer.innerGlow = false;
      this.highlightLayer.outerGlow = false;
    }
    this._setupLighting();
    logger.game("World ready");
  }

  private _setupLighting(): void {
    const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.6;
    ambient.diffuse = new Color3(1, 1, 1);
    ambient.groundColor = new Color3(0.3, 0.3, 0.3);

    const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), this.scene);
    sun.intensity = 0.8;
    sun.diffuse = new Color3(1, 0.95, 0.8);
    logger.game("Lighting set up");
  }

  loadRegion(data: Region): void {
    if (this.regions.has(data.id)) {
      logger.game(`Region "${data.id}" already loaded — skipping`);
      return;
    }
    this.regions.set(data.id, new GameRegion(data, this.scene, this.highlightLayer));
  }

  reloadRegion(fresh: Region): void {
    const region = this.regions.get(fresh.id);
    if (region) {
      region.reloadAll(fresh);
    } else {
      this.loadRegion(fresh);
    }
  }

  reloadChunk(chunkData: ChunkData): void {
    const region = this.regions.get(chunkData.region);
    if (!region) {
      logger.game(`reloadChunk — region "${chunkData.region}" not loaded, skipping`);
      return;
    }
    const key = `${chunkData.chunkX},${chunkData.chunkZ}`;
    region.reloadChunk(key, chunkData);
  }

  dispose(): void {
    logger.game("Disposing world");
    this.regions.forEach((r) => r.dispose());
    this.regions.clear();
    this.highlightLayer?.dispose();
  }
}
