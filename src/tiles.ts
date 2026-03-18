import { 
  Scene, 
  MeshBuilder, 
  StandardMaterial, 
  Color3,
  Mesh,
  DynamicTexture
} from "@babylonjs/core";

export const TILE_SIZE = 32;
export const TILE_COUNT = 21;
export const WORLD_ORIGIN = 16384;

const highlights = new Map<string, Mesh>();

export function createTiles(scene: Scene) {
  const half = Math.floor(TILE_COUNT / 2);

  for (let x = 0; x < TILE_COUNT; x++) {
    for (let z = 0; z < TILE_COUNT; z++) {
      const centreX = WORLD_ORIGIN + (x - half) * TILE_SIZE;
      const centreZ = WORLD_ORIGIN + (z - half) * TILE_SIZE;
      const relX = x - half;
      const relZ = z - half;

      // ── Tile base ──────────────────────────────────────
      const tile = MeshBuilder.CreateGround(`tile-${x}-${z}`, {
        width: TILE_SIZE, height: TILE_SIZE
      }, scene);
      tile.position.set(centreX, 0, centreZ);
      tile.isPickable = true;
      tile.renderingGroupId = 0;
      tile.metadata = { tileX: x, tileZ: z, worldX: centreX, worldZ: centreZ };

      const isEven = (x + z) % 2 === 0;
      const mat = new StandardMaterial(`tmat-${x}-${z}`, scene);
      mat.diffuseColor = isEven
        ? new Color3(0.20, 0.26, 0.20)
        : new Color3(0.13, 0.17, 0.13);
      mat.specularColor = Color3.Black();
      tile.material = mat;

      // ── Label ──────────────────────────────────────────
      const label = MeshBuilder.CreateGround(`label-${x}-${z}`, {
        width: TILE_SIZE * 0.85, height: TILE_SIZE * 0.85
      }, scene);
      label.position.set(centreX, 0.5, centreZ); // High enough Y gap, no z-fight
      label.isPickable = false;
      label.renderingGroupId = 1; // Always renders on top of group 0

      const tex = new DynamicTexture(`tex-${x}-${z}`, { width: 128, height: 128 }, scene);
      tex.hasAlpha = true;
      const ctx = tex.getContext() as unknown as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, 128, 128);
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`${relX},${relZ}`, 64, 64);
      tex.update();

      const labelMat = new StandardMaterial(`lmat-${x}-${z}`, scene);
      labelMat.diffuseTexture = tex;
      labelMat.opacityTexture = tex;
      labelMat.emissiveColor = Color3.White();
      labelMat.disableLighting = true;
      labelMat.backFaceCulling = false;
      label.material = labelMat;

      // ── Highlight ──────────────────────────────────────
      const highlight = MeshBuilder.CreateGround(`h-${x}-${z}`, {
        width: TILE_SIZE - 1, height: TILE_SIZE - 1
      }, scene);
      highlight.position.set(centreX, 0.1, centreZ);
      highlight.isPickable = false;
      highlight.renderingGroupId = 1;
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
