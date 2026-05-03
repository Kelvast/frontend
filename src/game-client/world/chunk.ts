import {
  Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  DynamicTexture,
  Color3,
  Vector3,
  HighlightLayer,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import { ChunkData, TileData, WORLD } from "mmo-shared";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { buildTileMesh } from "./tile-mesh";
import { tileWorldY } from "./tile-height";
import { getTileMaterial } from "./tile-material-cache";
import { buildChunkGrid } from "./chunk-grid";

export class Chunk {
  private meshes: Mesh[] = [];
  private grids: Mesh[] = [];
  private devMeshes: Mesh[] = [];

  constructor(
    private data: ChunkData,
    private scene: Scene,
    /*
     * Flat region-wide tile lookup built by GameRegion before any chunks spawn.
     * Covers all chunks in the region so corner height averaging works seamlessly
     * across chunk boundaries without any per-chunk neighbour resolution.
     */
    private getRegionTile: (tileX: number, tileZ: number) => TileData | null,
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
        const mesh = buildTileMesh(tiles, row, col, chunkX, chunkZ, this.scene, this.getRegionTile);
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
      tileMeshes.forEach((m) => {
        m.isPickable = false;
      });
      this.meshes = tileMeshes;
    }

    const grid = buildChunkGrid(chunkX, chunkZ, this.scene);
    this.grids.push(grid);

    if (DEV_MODE && this.highlightLayer) {
      this._spawnDevOverlay(tiles, chunkX, chunkZ, grid);
    }

    logger.game(`Chunk (${chunkX}, ${chunkZ}) spawned`);
  }

  private _spawnDevOverlay(tiles: TileData[][], chunkX: number, chunkZ: number, grid: Mesh): void {
    const hl = this.highlightLayer!;
    const half = WORLD.TILE_SIZE / 2;
    const outlineMat = new StandardMaterial(`outline-mat-${chunkX}-${chunkZ}`, this.scene);
    outlineMat.emissiveColor = Color3.Black();
    outlineMat.wireframe = true;

    for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
      for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
        const tile = tiles[row][col];
        const worldX = (chunkX * WORLD.CHUNK_SIZE + col) * WORLD.TILE_SIZE + half;
        const worldZ = (chunkZ * WORLD.CHUNK_SIZE + row) * WORLD.TILE_SIZE + half;
        const worldY = tileWorldY(tile.y);

        const outline = buildTileMesh(
          tiles,
          row,
          col,
          chunkX,
          chunkZ,
          this.scene,
          this.getRegionTile,
        );
        outline.name = `outline-${chunkX}-${chunkZ}-${col}-${row}`;
        outline.scaling = new Vector3(0.97, 1, 0.97);
        outline.position.y += 0.001;
        outline.material = outlineMat;
        outline.isPickable = false;
        this.devMeshes.push(outline);

        const label = this._makeCoordLabel(
          chunkX * WORLD.CHUNK_SIZE + col,
          chunkZ * WORLD.CHUNK_SIZE + row,
          worldX,
          worldY,
          worldZ,
          `label-${chunkX}-${chunkZ}-${col}-${row}`,
        );
        this.devMeshes.push(label);
      }
    }

    grid.actionManager = new ActionManager(this.scene);
    grid.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        grid.isVisible = true;
        hl.addMesh(grid, Color3.White());
      }),
    );
    grid.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        hl.removeMesh(grid);
        grid.isVisible = false;
      }),
    );
  }

  private _makeCoordLabel(
    tileX: number,
    tileZ: number,
    worldX: number,
    worldY: number,
    worldZ: number,
    name: string,
  ): Mesh {
    const resolution = 128;
    const lineHeight = 28;

    const tex = new DynamicTexture(
      `tex-${name}`,
      { width: resolution, height: resolution },
      this.scene,
    );
    tex.hasAlpha = true;

    const ctx = tex.getContext();
    ctx.clearRect(0, 0, resolution, resolution);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = "bold 22px monospace";

    const lx = `x: ${tileX}`;
    const lz = `z: ${tileZ}`;
    ctx.fillText(lx, (resolution - ctx.measureText(lx).width) / 2, resolution / 2 - lineHeight / 2);
    ctx.fillText(lz, (resolution - ctx.measureText(lz).width) / 2, resolution / 2 + lineHeight / 2);
    tex.update();

    const plane = MeshBuilder.CreateGround(
      name,
      { width: WORLD.TILE_SIZE * 0.9, height: WORLD.TILE_SIZE * 0.9 },
      this.scene,
    );
    plane.position = new Vector3(worldX, worldY + 0.003, worldZ);
    plane.isPickable = false;

    const mat = new StandardMaterial(`mat-${name}`, this.scene);
    mat.diffuseTexture = tex;
    mat.opacityTexture = tex;
    mat.specularColor = Color3.Black();
    mat.emissiveColor = Color3.White();
    plane.material = mat;

    return plane;
  }

  dispose(): void {
    logger.game(`Disposing chunk (${this.data.chunkX}, ${this.data.chunkZ})`);
    this.meshes.forEach((m) => m.dispose());
    this.grids.forEach((m) => m.dispose());
    this.devMeshes.forEach((m) => m.dispose());
    this.meshes = [];
    this.grids = [];
    this.devMeshes = [];
  }
}
