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
} from "@babylonjs/core";
import { ChunkData } from "../../types/mmo/world";
import { WORLD } from "../constants";
import { TILE_CONFIG } from "./tile-config";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";

export class Chunk {
  private meshes: Mesh[] = [];
  private outlines: Mesh[] = [];

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

        const mesh = MeshBuilder.CreateGround(
          `tile-${chunkX}-${chunkZ}-${col}-${row}`,
          { width: WORLD.TILE_SIZE, height: WORLD.TILE_SIZE },
          this.scene,
        );
        mesh.position = new Vector3(worldX, tile.y, worldZ);

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
            outline.position = new Vector3(worldX, tile.y + 0.001, worldZ);
            outline.material = outlineMat;
            outline.isPickable = false;
            this.outlines.push(outline);
          }
        }

        this.meshes.push(mesh);
      }
    }

    logger.game(`Chunk (${chunkX}, ${chunkZ}) spawned — ${this.meshes.length} tiles`);
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
    this.meshes = [];
    this.outlines = [];
  }
}
