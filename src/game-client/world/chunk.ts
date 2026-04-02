import {
  Scene,
  Mesh,
  HighlightLayer,
} from "@babylonjs/core";
import { ChunkData, TileData, WORLD } from "mmo-shared";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { buildTileMesh } from "./tile-mesh";
import { getTileMaterial } from "./tile-material-cache";
import { buildChunkGrid } from "./chunk-grid";
import { buildChunkDevOverlay, DevOverlay } from "./chunk-dev-overlay";

export class Chunk {
  private meshes: Mesh[] = [];
  private grids: Mesh[] = [];
  private devOverlay: DevOverlay | null = null;

  constructor(
    private data: ChunkData,
    private scene: Scene,
    private highlightLayer?: HighlightLayer,
  ) {
    logger.game(`Spawning chunk (${data.chunkX}, ${data.chunkZ}) in region "${data.region}"`);
    this.spawn();
  }

  getTileAt(localCol: number, localRow: number): TileData | null {
    const row = this.data.tiles[localRow];
    if (!row) return null;
    return row[localCol] ?? null;
  }

  getMeshes(): Mesh[] {
    return this.meshes;
  }

  private spawn(): void {
    const { chunkX, chunkZ, tiles } = this.data;
    const tileMeshes: Mesh[] = [];

    for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
      for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
        const tile = tiles[row][col];
        const mesh = buildTileMesh(tiles, row, col, chunkX, chunkZ, this.scene);
        mesh.material = getTileMaterial(tile, this.scene);
        mesh.isPickable = false;
        tileMeshes.push(mesh);
      }
    }

    const merged = Mesh.MergeMeshes(tileMeshes, true, true, undefined, false, true);
    if (merged) {
      merged.name = `chunk-${chunkX}-${chunkZ}`;
      merged.isPickable = false;
      this.meshes = [merged];
    } else {
      tileMeshes.forEach((m) => { m.isPickable = false; });
      this.meshes = tileMeshes;
    }

    const grid = buildChunkGrid(chunkX, chunkZ, this.scene);
    this.grids.push(grid);

    if (DEV_MODE && this.highlightLayer) {
      this.devOverlay = buildChunkDevOverlay(
        tiles,
        chunkX,
        chunkZ,
        this.highlightLayer,
        grid,
        this.scene,
      );
    }

    logger.game(`Chunk (${chunkX}, ${chunkZ}) spawned`);
  }

  dispose(): void {
    logger.game(`Disposing chunk (${this.data.chunkX}, ${this.data.chunkZ})`);
    this.meshes.forEach((m) => m.dispose());
    this.grids.forEach((m) => m.dispose());
    this.devOverlay?.dispose();
    this.meshes = [];
    this.grids = [];
    this.devOverlay = null;
  }
}
