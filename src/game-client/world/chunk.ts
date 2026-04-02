import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Scene,
  Mesh,
  ActionManager,
  ExecuteCodeAction,
  HighlightLayer,
  DynamicTexture,
} from "@babylonjs/core";
import { ChunkData } from "../../types/mmo/world";
import { TILE_CONFIG } from "./tile-config";
import { tileWorldY } from "./tile-height";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { WORLD } from "mmo-shared";

export class Chunk {
  private meshes: Mesh[] = [];
  private outlines: Mesh[] = [];
  private labels: Mesh[] = [];

  constructor(
    private data: ChunkData,
    private scene: Scene,
    private highlightLayer?: HighlightLayer,
  ) {
    logger.game(`Spawning chunk (${data.chunkX}, ${data.chunkZ}) in region "${data.region}"`);
    this.spawn();
  }

  private spawn(): void {
    const { chunkX, chunkZ, tiles } = this.data;
    const outlineMat = DEV_MODE ? this._makeOutlineMat() : null;

    for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
      for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
        const tile = tiles[row][col];
        const worldX = (chunkX * WORLD.CHUNK_SIZE + col) * WORLD.TILE_SIZE;
        const worldZ = (chunkZ * WORLD.CHUNK_SIZE + row) * WORLD.TILE_SIZE;
        const worldY = tileWorldY(tile.y);

        const mesh = MeshBuilder.CreateGround(
          `tile-${chunkX}-${chunkZ}-${col}-${row}`,
          { width: WORLD.TILE_SIZE, height: WORLD.TILE_SIZE },
          this.scene,
        );
        mesh.position = new Vector3(worldX, worldY, worldZ);

        const mat = new StandardMaterial(`mat-${chunkX}-${chunkZ}-${col}-${row}`, this.scene);
        mat.diffuseColor = TILE_CONFIG[tile.type].color;
        mat.specularColor = Color3.Black();
        mesh.material = mat;

        if (DEV_MODE && this.highlightLayer) {
          const hl = this.highlightLayer;
          mesh.actionManager = new ActionManager(this.scene);
          mesh.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
              hl.addMesh(mesh, Color3.White());
            }),
          );
          mesh.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
              hl.removeMesh(mesh);
            }),
          );

          if (outlineMat) {
            const outline = MeshBuilder.CreateGround(
              `outline-${chunkX}-${chunkZ}-${col}-${row}`,
              { width: WORLD.TILE_SIZE * 0.97, height: WORLD.TILE_SIZE * 0.97 },
              this.scene,
            );
            outline.position = new Vector3(worldX, worldY + 0.001, worldZ);
            outline.material = outlineMat;
            outline.isPickable = false;
            this.outlines.push(outline);
          }

          const label = this._makeCoordLabel(
            chunkX * WORLD.CHUNK_SIZE + col,
            chunkZ * WORLD.CHUNK_SIZE + row,
            worldX,
            worldY,
            worldZ,
            `label-${chunkX}-${chunkZ}-${col}-${row}`,
          );
          this.labels.push(label);
        }

        this.meshes.push(mesh);
      }
    }

    logger.game(`Chunk (${chunkX}, ${chunkZ}) spawned — ${this.meshes.length} tiles`);
  }

  private _makeCoordLabel(
    tileX: number,
    tileZ: number,
    worldX: number,
    worldY: number,
    worldZ: number,
    name: string,
  ): Mesh {
    const size = WORLD.TILE_SIZE * 0.9;
    const resolution = 128;
    const lineHeight = 28;
    const font = "bold 22px monospace";

    const tex = new DynamicTexture(`tex-${name}`, { width: resolution, height: resolution }, this.scene);
    tex.hasAlpha = true;

    const ctx = tex.getContext();
    ctx.clearRect(0, 0, resolution, resolution);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.fillText(`x: ${tileX}`, resolution / 2, resolution / 2 - lineHeight / 2);
    ctx.fillText(`z: ${tileZ}`, resolution / 2, resolution / 2 + lineHeight / 2);
    tex.update();

    const plane = MeshBuilder.CreateGround(
      name,
      { width: size, height: size },
      this.scene,
    );
    plane.position = new Vector3(worldX, worldY + 0.002, worldZ);
    plane.isPickable = false;

    const mat = new StandardMaterial(`mat-${name}`, this.scene);
    mat.diffuseTexture = tex;
    mat.opacityTexture = tex;
    mat.specularColor = Color3.Black();
    mat.emissiveColor = Color3.White();
    plane.material = mat;

    return plane;
  }

  private _makeOutlineMat(): StandardMaterial {
    const mat = new StandardMaterial(
      `outline-mat-${this.data.chunkX}-${this.data.chunkZ}`,
      this.scene,
    );
    mat.diffuseColor = Color3.Black();
    mat.emissiveColor = Color3.Black();
    mat.wireframe = true;
    return mat;
  }

  dispose(): void {
    logger.game(`Disposing chunk (${this.data.chunkX}, ${this.data.chunkZ})`);
    this.meshes.forEach((m) => m.dispose());
    this.outlines.forEach((m) => m.dispose());
    this.labels.forEach((m) => m.dispose());
    this.meshes = [];
    this.outlines = [];
    this.labels = [];
  }
}
