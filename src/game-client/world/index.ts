import { Scene, HighlightLayer } from "@babylonjs/core";
import { GameRegion } from "./region";
import { logger } from "../../utils/logger";
import { Region, ChunkData, TileData } from "mmo-shared";
import { DEV_MODE } from "../../utils/dev";
import { setupScene } from "../scene-setup";

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
    setupScene(scene);
    logger.game("World ready");
  }

  getTileAt(tileX: number, tileZ: number): TileData | null {
    for (const region of this.regions.values()) {
      const tile = region.getTileAt(tileX, tileZ);
      if (tile) return tile;
    }
    return null;
  }

  loadRegion(data: Region): void {
    if (this.regions.has(data.id)) {
      logger.game(`Region "${data.id}" already loaded - skipping`);
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
      logger.game(`reloadChunk - region "${chunkData.region}" not loaded, skipping`);
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
