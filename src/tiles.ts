import { 
  Scene, 
  MeshBuilder, 
  StandardMaterial, 
  Color3, 
  PointerEventTypes
} from "@babylonjs/core";
import { Mesh } from "@babylonjs/core";

const TILE_SIZE = 32;
const tileMeshes: Mesh[] = [];
const tileHighlights: Mesh[] = [];

export function createTiles(scene: Scene) {
  // 13x13 RS region
  for (let x = 0; x < 13; x++) {
    for (let z = 0; z < 13; z++) {
      const tile = MeshBuilder.CreateGround(`tile-${x}-${z}`, { 
        width: TILE_SIZE, height: TILE_SIZE 
      }, scene);
      tile.position.x = 16384 + (x - 6.5) * TILE_SIZE;
      tile.position.z = 16384 + (z - 6.5) * TILE_SIZE;
      tile.position.y = 0.01;
      tile.isPickable = true;
      tile.metadata = { tileX: x, tileZ: z };
      tileMeshes.push(tile);

      // Highlight
      const highlight = MeshBuilder.CreateGround(`h-${x}-${z}`, { 
        width: TILE_SIZE - 0.1, height: TILE_SIZE - 0.1 
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

  // Click → walk
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
      const pickInfo = scene.pick(scene.pointerX!, scene.pointerY!);
      if (pickInfo.hit && pickInfo.pickedMesh?.metadata?.tileX !== undefined) {
        const { tileX, tileZ } = pickInfo.pickedMesh.metadata as any;
        const worldX = 16384 + (tileX - 6.5) * TILE_SIZE;
        const worldZ = 16384 + (tileZ - 6.5) * TILE_SIZE;
        
        console.log(`Walk to (${worldX.toFixed(0)}, ${worldZ.toFixed(0)})`);
        window.dispatchEvent(new CustomEvent("walkTo", {
          detail: { x: worldX, y: worldZ }
        }));

        const idx = tileZ * 13 + tileX;
        if (tileHighlights[idx]) {
          tileHighlights[idx].isVisible = true;
          setTimeout(() => tileHighlights[idx].isVisible = false, 500);
        }
      }
    }
  });
}
