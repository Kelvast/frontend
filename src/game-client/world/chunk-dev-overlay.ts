import {
  Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  DynamicTexture,
  Color3,
  Vector3,
  HighlightLayer,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import { TileData, WORLD } from "mmo-shared";
import { buildTileMesh } from "./tile-mesh";
import { tileWorldY } from "./tile-height";

function makeTileLabel(
  tileX: number,
  tileZ: number,
  worldX: number,
  worldY: number,
  worldZ: number,
  name: string,
  scene: Scene,
): Mesh {
  const size = WORLD.TILE_SIZE * 0.9;
  const resolution = 128;
  const lineHeight = 28;
  const font = "bold 22px monospace";

  const tex = new DynamicTexture(`tex-${name}`, { width: resolution, height: resolution }, scene);
  tex.hasAlpha = true;

  const ctx = tex.getContext();
  ctx.clearRect(0, 0, resolution, resolution);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.font = font;

  const labelX = `x: ${tileX}`;
  const labelZ = `z: ${tileZ}`;
  ctx.fillText(labelX, (resolution - ctx.measureText(labelX).width) / 2, resolution / 2 - lineHeight / 2);
  ctx.fillText(labelZ, (resolution - ctx.measureText(labelZ).width) / 2, resolution / 2 + lineHeight / 2);
  tex.update();

  const plane = MeshBuilder.CreateGround(name, { width: size, height: size }, scene);
  plane.position = new Vector3(worldX, worldY + 0.003, worldZ);
  plane.isPickable = false;

  const mat = new StandardMaterial(`mat-${name}`, scene);
  mat.diffuseTexture = tex;
  mat.opacityTexture = tex;
  mat.specularColor = Color3.Black();
  mat.emissiveColor = Color3.White();
  plane.material = mat;

  return plane;
}

function makeOutlineMat(name: string, scene: Scene): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.Black();
  mat.emissiveColor = Color3.Black();
  mat.wireframe = true;
  return mat;
}

export interface DevOverlay {
  dispose(): void;
}

export function buildChunkDevOverlay(
  tiles: TileData[][],
  chunkX: number,
  chunkZ: number,
  highlightLayer: HighlightLayer,
  gridMesh: Mesh,
  scene: Scene,
): DevOverlay {
  const outlines: Mesh[] = [];
  const labels: Mesh[] = [];
  const outlineMat = makeOutlineMat(`outline-mat-${chunkX}-${chunkZ}`, scene);

  for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
    for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
      const tile = tiles[row][col];
      const worldX = (chunkX * WORLD.CHUNK_SIZE + col) * WORLD.TILE_SIZE;
      const worldZ = (chunkZ * WORLD.CHUNK_SIZE + row) * WORLD.TILE_SIZE;
      const worldY = tileWorldY(tile.y);

      const outline = buildTileMesh(tiles, row, col, chunkX, chunkZ, scene);
      outline.name = `outline-${chunkX}-${chunkZ}-${col}-${row}`;
      outline.scaling = new Vector3(0.97, 1, 0.97);
      outline.position.y += 0.001;
      outline.material = outlineMat;
      outline.isPickable = false;
      outlines.push(outline);

      const label = makeTileLabel(
        chunkX * WORLD.CHUNK_SIZE + col,
        chunkZ * WORLD.CHUNK_SIZE + row,
        worldX,
        worldY,
        worldZ,
        `label-${chunkX}-${chunkZ}-${col}-${row}`,
        scene,
      );
      labels.push(label);
    }
  }

  gridMesh.actionManager = new ActionManager(scene);
  gridMesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
      gridMesh.isVisible = true;
      highlightLayer.addMesh(gridMesh, Color3.White());
    }),
  );
  gridMesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
      highlightLayer.removeMesh(gridMesh);
      gridMesh.isVisible = false;
    }),
  );

  return {
    dispose() {
      outlines.forEach((m) => m.dispose());
      labels.forEach((m) => m.dispose());
      outlineMat.dispose();
    },
  };
}
