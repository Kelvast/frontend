import { MeshBuilder, Mesh, Vector3, Scene } from "@babylonjs/core";
import { WORLD } from "kelvast-shared";

export function buildChunkGrid(chunkX: number, chunkZ: number, scene: Scene): Mesh {
  const size = WORLD.CHUNK_SIZE * WORLD.TILE_SIZE;

  const grid = MeshBuilder.CreateGround(
    `grid-${chunkX}-${chunkZ}`,
    { width: size, height: size },
    scene,
  );

  grid.position = new Vector3(chunkX * size + size / 2, 0.01, chunkZ * size + size / 2);

  grid.isVisible = false;
  grid.isPickable = true;

  return grid;
}
