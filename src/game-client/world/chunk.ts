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
import { ChunkData, TileData, WORLD } from "mmo-shared";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { buildTileMesh } from "./tile-mesh";
import { tileWorldY, floorWorldY } from "./tile-height";
import { getTileMaterial } from "./tile-material-cache";
import { buildChunkNavmesh, NavNode } from "./navmesh";

const PICKABLE_Y_OFFSET = 0.01;

export class Chunk {
  private meshes: Mesh[] = [];
  private tileMeshes: Mesh[] = [];
  private devMeshes: Mesh[] = [];

  constructor(
    private data: ChunkData,
    private scene: Scene,
    private highlightLayer?: HighlightLayer,
  ) {
    logger.game(`Spawning chunk (${data.chunkX}, ${data.chunkZ}) in region "${data.region}"`);
    this.spawn();
  }

  /*
   * Returns the navmesh nodes for this chunk so GameWorld can merge them
   * into the world-flat navmesh. Called by GameRegion after construction.
   */
  buildNavNodes(): Map<string, NavNode> {
    return buildChunkNavmesh(this.data);
  }

  getMeshes(): Mesh[] {
    return this.meshes;
  }

  private spawn(): void {
    const { chunkX, chunkZ, tiles } = this.data;
    const tileMeshes: Mesh[] = [];
    const s = WORLD.TILE_SIZE;

    for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
      for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
        const tile = tiles[row][col];
        const mesh = buildTileMesh(tiles, row, col, chunkX, chunkZ, this.scene);
        mesh.material = getTileMaterial(tile, this.scene);
        mesh.isPickable = false;
        tileMeshes.push(mesh);
      }
    }

    const merged = Mesh.MergeMeshes(tileMeshes, true, true, undefined, false, true);
    if (merged) {
      merged.name = `chunk-${chunkX}-${chunkZ}`;
      merged.isPickable = false;
      this.meshes = [merged];
    } else {
      tileMeshes.forEach((m) => { m.isPickable = false; });
      this.meshes = tileMeshes;
    }

    this.spawnPickableTiles(tiles, chunkX, chunkZ, s);

    if (DEV_MODE && this.highlightLayer) {
      this._spawnDevOverlay(tiles, chunkX, chunkZ);
    }

    logger.game(`Chunk (${chunkX}, ${chunkZ}) spawned`);
  }

  /*
   * One invisible pickable ground plane per walkable tile, named tile-{x}-{z}.
   * Ray-casts in PointerInput only hit these — unwalkable tiles have no mesh.
   */
  private spawnPickableTiles(tiles: TileData[][], chunkX: number, chunkZ: number, s: number): void {
    const navNodes = buildChunkNavmesh(this.data);

    for (const node of navNodes.values()) {
      if (!node.walkable) continue;

      const mesh = MeshBuilder.CreateGround(
        `tile-${node.x}-${node.z}`,
        { width: s, height: s },
        this.scene,
      );

      mesh.position = new Vector3(
        node.x * s + s / 2,
        node.worldY + PICKABLE_Y_OFFSET,
        node.z * s + s / 2,
      );
      mesh.isPickable = true;
      mesh.isVisible = false;
      this.tileMeshes.push(mesh);
    }
  }

  private _spawnDevOverlay(tiles: TileData[][], chunkX: number, chunkZ: number): void {
    const hl = this.highlightLayer!;
    const half = WORLD.TILE_SIZE / 2;
    const s = WORLD.TILE_SIZE;

    for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
      for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
        const tile = tiles[row][col];
        const tileX = chunkX * WORLD.CHUNK_SIZE + col;
        const tileZ = chunkZ * WORLD.CHUNK_SIZE + row;
        const worldX = tileX * s + half;
        const worldZ = tileZ * s + half;
        const worldY = floorWorldY(tile.floor) + tileWorldY(tile.y);

        const outline = buildTileMesh(tiles, row, col, chunkX, chunkZ, this.scene);
        outline.name = `outline-${chunkX}-${chunkZ}-${col}-${row}`;
        outline.scaling = new Vector3(0.97, 1, 0.97);
        outline.position.y += 0.001;
        const outlineMat = new StandardMaterial(`outline-mat-${chunkX}-${chunkZ}-${col}-${row}`, this.scene);
        outlineMat.emissiveColor = Color3.Black();
        outlineMat.wireframe = true;
        outline.material = outlineMat;
        outline.isPickable = false;
        this.devMeshes.push(outline);

        const label = this._makeCoordLabel(tileX, tileZ, worldX, worldY, worldZ, `label-${chunkX}-${chunkZ}-${col}-${row}`);
        this.devMeshes.push(label);
      }
    }
  }

  private _makeCoordLabel(tileX: number, tileZ: number, worldX: number, worldY: number, worldZ: number, name: string): Mesh {
    const resolution = 128;
    const lineHeight = 28;
    const s = WORLD.TILE_SIZE;

    const tex = new DynamicTexture(`tex-${name}`, { width: resolution, height: resolution }, this.scene);
    tex.hasAlpha = true;

    const ctx = tex.getContext();
    ctx.clearRect(0, 0, resolution, resolution);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = "bold 22px monospace";

    const lx = `x: ${tileX}`;
    const lz = `z: ${tileZ}`;
    ctx.fillText(lx, (resolution - ctx.measureText(lx).width) / 2, resolution / 2 - lineHeight / 2);
    ctx.fillText(lz, (resolution - ctx.measureText(lz).width) / 2, resolution / 2 + lineHeight / 2);
    tex.update();

    const plane = MeshBuilder.CreateGround(name, { width: s * 0.9, height: s * 0.9 }, this.scene);
    plane.position = new Vector3(worldX, worldY + 0.003, worldZ);
    plane.isPickable = false;

    const mat = new StandardMaterial(`mat-${name}`, this.scene);
    mat.diffuseTexture = tex;
    mat.opacityTexture = tex;
    mat.specularColor = Color3.Black();
    mat.emissiveColor = Color3.White();
    plane.material = mat;

    return plane;
  }

  dispose(): void {
    logger.game(`Disposing chunk (${this.data.chunkX}, ${this.data.chunkZ})`);
    this.meshes.forEach((m) => m.dispose());
    this.tileMeshes.forEach((m) => m.dispose());
    this.devMeshes.forEach((m) => m.dispose());
    this.meshes = [];
    this.tileMeshes = [];
    this.devMeshes = [];
  }
}
