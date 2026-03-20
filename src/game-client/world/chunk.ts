import { MeshBuilder, StandardMaterial, Color3, Vector3, Scene, Mesh } from "@babylonjs/core";
import { ChunkData } from "../../types/mmo/world";
import { WORLD } from "../constants";
import { TILE_CONFIG } from "./tile-config";
import { logger } from "../../utils/logger";

export class Chunk {
  private meshes: Mesh[] = [];

  constructor(
    private data: ChunkData,
    private scene: Scene,
  ) {
    logger.game(`Spawning chunk (${data.chunkX}, ${data.chunkZ}) in region "${data.region}"`);
    this.spawn();
  }

  private spawn() {
    const { chunkX, chunkZ, tiles } = this.data;

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

        this.meshes.push(mesh);
      }
    }

    logger.game(`Chunk (${chunkX}, ${chunkZ}) spawned — ${this.meshes.length} tiles`);
  }

  dispose() {
    logger.game(`Disposing chunk (${this.data.chunkX}, ${this.data.chunkZ})`);
    this.meshes.forEach((m) => m.dispose());
    this.meshes = [];
  }
}
