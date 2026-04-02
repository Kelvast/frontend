import { MeshBuilder, Mesh, Vector3, Scene } from "@babylonjs/core";
import { WORLD } from "mmo-shared";

export function buildChunkGrid(chunkX: number, chunkZ: number, scene: Scene): Mesh {
  const size = WORLD.CHUNK_SIZE * WORLD.TILE_SIZE;

  const grid = MeshBuilder.CreateGround(
    `grid-${chunkX}-${chunkZ}`,
    { width: size, height: size },
    scene,
  );

  grid.position = new Vector3(
    (chunkX * WORLD.CHUNK_SIZE + WORLD.CHUNK_SIZE / 2 - 0.5) * WORLD.TILE_SIZE,
    0.01,
    (chunkZ * WORLD.CHUNK_SIZE + WORLD.CHUNK_SIZE / 2 - 0.5) * WORLD.TILE_SIZE,
  );

  grid.isVisible = false;
  grid.isPickable = true;

  return grid;
}
