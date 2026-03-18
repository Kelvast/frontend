import { 
  Scene, 
  MeshBuilder, 
  StandardMaterial, 
  Color3,
  Mesh
} from "@babylonjs/core";

const TILE_SIZE = 32;
export const TILE_COUNT = 13;
export const WORLD_ORIGIN = 16384;

const tileHighlights: Mesh[] = [];

export function createTiles(scene: Scene) {
  for (let x = 0; x < TILE_COUNT; x++) {
    for (let z = 0; z < TILE_COUNT; z++) {
      const tile = MeshBuilder.CreateGround(`tile-${x}-${z}`, { 
        width: TILE_SIZE, height: TILE_SIZE 
      }, scene);
      tile.position.x = WORLD_ORIGIN + (x - TILE_COUNT / 2) * TILE_SIZE;
      tile.position.z = WORLD_ORIGIN + (z - TILE_COUNT / 2) * TILE_SIZE;
      tile.position.y = 0.01;
      tile.isPickable = true;
      tile.metadata = { tileX: x, tileZ: z };

      const mat = new StandardMaterial(`tmat-${x}-${z}`, scene);
      mat.diffuseColor = new Color3(0.2, 0.2, 0.2);
      mat.alpha = 0.8;
      tile.material = mat;

      // Highlight overlay
      const highlight = MeshBuilder.CreateGround(`h-${x}-${z}`, { 
        width: TILE_SIZE - 0.5, height: TILE_SIZE - 0.5 
      }, scene);
      highlight.position.copyFrom(tile.position);
      highlight.position.y = 0.02;
      const hMat = new StandardMaterial(`hmat-${x}-${z}`, scene);
      hMat.diffuseColor = new Color3(1, 1, 0);
      hMat.alpha = 0.4;
      highlight.material = hMat;
      highlight.isVisible = false;
      tileHighlights.push(highlight);
    }
  }
}

export function flashTile(tileX: number, tileZ: number) {
  const idx = tileZ * TILE_COUNT + tileX;
  const h = tileHighlights[idx];
  if (!h) return;
  h.isVisible = true;
  setTimeout(() => h.isVisible = false, 500);
}

export function tileToWorld(tileX: number, tileZ: number) {
  return {
    x: WORLD_ORIGIN + (tileX - TILE_COUNT / 2) * TILE_SIZE,
    z: WORLD_ORIGIN + (tileZ - TILE_COUNT / 2) * TILE_SIZE,
  };
}
