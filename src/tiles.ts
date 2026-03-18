import { 
  Scene, 
  MeshBuilder, 
  StandardMaterial, 
  Color3,
  Mesh
} from "@babylonjs/core";

export const TILE_SIZE = 32;
export const TILE_COUNT = 21; // Odd number = clean centre tile
export const WORLD_ORIGIN = 16384; // Matches server spawn

const highlights = new Map<string, Mesh>();

export function createTiles(scene: Scene) {
  // Half offset so grid is centred on WORLD_ORIGIN
  const half = Math.floor(TILE_COUNT / 2);

  for (let x = 0; x < TILE_COUNT; x++) {
    for (let z = 0; z < TILE_COUNT; z++) {
      // Centred: tile (half, half) sits exactly at WORLD_ORIGIN
      const centreX = WORLD_ORIGIN + (x - half) * TILE_SIZE;
      const centreZ = WORLD_ORIGIN + (z - half) * TILE_SIZE;

      const tile = MeshBuilder.CreateGround(`tile-${x}-${z}`, {
        width: TILE_SIZE, height: TILE_SIZE
      }, scene);
      tile.position.set(centreX, 0.01, centreZ);
      tile.isPickable = true;
      tile.metadata = { tileX: x, tileZ: z, worldX: centreX, worldZ: centreZ };

      const isEven = (x + z) % 2 === 0;
      const mat = new StandardMaterial(`tmat-${x}-${z}`, scene);
      mat.diffuseColor = isEven
        ? new Color3(0.20, 0.26, 0.20)
        : new Color3(0.13, 0.17, 0.13);
      mat.specularColor = Color3.Black();
      tile.material = mat;

      const highlight = MeshBuilder.CreateGround(`h-${x}-${z}`, {
        width: TILE_SIZE - 1, height: TILE_SIZE - 1
      }, scene);
      highlight.position.set(centreX, 0.02, centreZ);
      const hMat = new StandardMaterial(`hmat-${x}-${z}`, scene);
      hMat.diffuseColor = new Color3(1, 1, 0);
      hMat.alpha = 0.5;
      hMat.backFaceCulling = false;
      highlight.material = hMat;
      highlight.isVisible = false;
      highlights.set(`${x},${z}`, highlight);
    }
  }
}

export function flashTile(tileX: number, tileZ: number) {
  highlights.forEach(h => h.isVisible = false);
  const h = highlights.get(`${tileX},${tileZ}`);
  if (!h) return;
  h.isVisible = true;
  setTimeout(() => (h.isVisible = false), 600);
}
