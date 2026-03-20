import { MeshBuilder, StandardMaterial, Color3, Vector3, Scene, Mesh } from "@babylonjs/core";
import { ChunkData } from "../../types/mmo/world";
import { TILE_CONFIG } from "./tile-config";
import { WORLD } from "../constants";

export class Chunk {
  private meshes: Mesh[] = [];

  constructor(
    private data: ChunkData,
    private scene: Scene,
  ) {
    this.spawn();
  }

  private spawn() {
    const { chunkX, chunkZ, tiles } = this.data;

    for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
      for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
        const tileType = tiles[row][col].type;

        const worldX = (chunkX * WORLD.CHUNK_SIZE + col) * WORLD.TILE_SIZE;
        const worldZ = (chunkZ * WORLD.CHUNK_SIZE + row) * WORLD.TILE_SIZE;

        const mesh = MeshBuilder.CreateGround(
          `tile-${chunkX}-${chunkZ}-${col}-${row}`,
          { width: WORLD.TILE_SIZE, height: WORLD.TILE_SIZE },
          this.scene,
        );

        mesh.position = new Vector3(worldX, 0, worldZ);

        const mat = new StandardMaterial(`mat-${chunkX}-${chunkZ}-${col}-${row}`, this.scene);
        mat.diffuseColor = TILE_CONFIG[tileType].color;
        mat.specularColor = Color3.Black();
        mesh.material = mat;

        this.meshes.push(mesh);
      }
    }
  }

  dispose() {
    this.meshes.forEach((m) => m.dispose());
    this.meshes = [];
  }
}
