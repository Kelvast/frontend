import {
  Scene,
  Mesh,
  MeshBuilder,
  VertexData,
  StandardMaterial,
  DynamicTexture,
  Color3,
  Vector3,
  HighlightLayer,
} from "@babylonjs/core";
import { ChunkData, TileData, WORLD } from "mmo-shared";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { buildTileMesh } from "./tile-mesh";
import { tileWorldY, floorWorldY } from "./tile-height";
import { getTileMaterial } from "./tile-material-cache";
import { buildChunkNavmesh, NavNode } from "./navmesh";

export class Chunk {
  private meshes: Mesh[] = [];
  private tileMeshes: Mesh[] = [];
  private devMeshes: Mesh[] = [];
  private navNodes: Map<string, NavNode> | null = null;

  constructor(
    private data: ChunkData,
    private scene: Scene,
    private highlightLayer?: HighlightLayer,
  ) {
    logger.game(`Spawning chunk (${data.chunkX}, ${data.chunkZ}) in region "${data.region}"`);
    this.spawn();
  }

  buildNavNodes(): Map<string, NavNode> {
    return this.navNodes!;
  }

  getMeshes(): Mesh[] {
    return this.meshes;
  }

  private spawn(): void {
    const { chunkX, chunkZ, tiles } = this.data;
    const tileMeshes: Mesh[] = [];
    const s = WORLD.TILE_SIZE;

    this.navNodes = buildChunkNavmesh(this.data);

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
      tileMeshes.forEach((m) => {
        m.isPickable = false;
      });
      this.meshes = tileMeshes;
    }

    this.spawnPickableTiles(tiles, chunkX, chunkZ, s);

    if (DEV_MODE && this.highlightLayer) {
      this._spawnDevOverlay(tiles, chunkX, chunkZ);
    }

    logger.game(`Chunk (${chunkX}, ${chunkZ}) spawned`);
  }

  /*
   * One invisible pickable mesh per walkable tile, built with the same
   * 4-corner vertex geometry as the visual tile. A flat CreateGround plane
   * misses ray-casts on sloped tiles because the plane diverges from the
   * visual surface at tile edges. Using the real quad geometry means the
   * ray hits exactly what the player sees.
   */
  private spawnPickableTiles(tiles: TileData[][], chunkX: number, chunkZ: number, s: number): void {
    const half = s / 2;

    for (const node of this.navNodes!.values()) {
      if (!node.walkable) continue;

      const row = node.z - chunkZ * WORLD.CHUNK_SIZE;
      const col = node.x - chunkX * WORLD.CHUNK_SIZE;

      const yNW = this.cornerY(tiles, row, col, -1, -1);
      const yNE = this.cornerY(tiles, row, col, -1, 1);
      const ySW = this.cornerY(tiles, row, col, 1, -1);
      const ySE = this.cornerY(tiles, row, col, 1, 1);

      const floorY = floorWorldY(node.floor);

      const positions: number[] = [
        -half,
        yNW,
        -half,
        half,
        yNE,
        -half,
        half,
        ySE,
        half,
        -half,
        ySW,
        half,
      ];
      const indices: number[] = [0, 1, 2, 0, 2, 3];
      const normals: number[] = [];
      VertexData.ComputeNormals(positions, indices, normals);

      const vd = new VertexData();
      vd.positions = positions;
      vd.indices = indices;
      vd.normals = normals;

      const mesh = new Mesh(`tile-${node.x}-${node.z}`, this.scene);
      vd.applyToMesh(mesh);

      mesh.position.x = node.x * s + half;
      mesh.position.y = floorY;
      mesh.position.z = node.z * s + half;
      mesh.isPickable = true;
      mesh.isVisible = false;
      mesh.material = null;
      this.tileMeshes.push(mesh);
    }
  }

  /*
   * Mirrors cornerY() from tile-mesh.ts exactly.
   * Must stay in sync with that function.
   */
  private cornerY(tiles: TileData[][], row: number, col: number, dr: number, dc: number): number {
    const clampRow = Math.max(0, Math.min(tiles.length - 1, row + dr));
    const clampCol = Math.max(0, Math.min(tiles[0].length - 1, col + dc));
    const r0 = Math.max(0, Math.min(tiles.length - 1, row));
    const c0 = Math.max(0, Math.min(tiles[0].length - 1, col));

    const heights = [
      tiles[r0][c0].y,
      tiles[clampRow][c0].y,
      tiles[r0][clampCol].y,
      tiles[clampRow][clampCol].y,
    ];

    return heights.reduce((sum, h) => sum + tileWorldY(h), 0) / heights.length;
  }

  private _spawnDevOverlay(tiles: TileData[][], chunkX: number, chunkZ: number): void {
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
        const outlineMat = new StandardMaterial(
          `outline-mat-${chunkX}-${chunkZ}-${col}-${row}`,
          this.scene,
        );
        outlineMat.emissiveColor = Color3.Black();
        outlineMat.wireframe = true;
        outline.material = outlineMat;
        outline.isPickable = false;
        this.devMeshes.push(outline);

        const label = this._makeCoordLabel(
          tileX,
          tileZ,
          worldX,
          worldY,
          worldZ,
          `label-${chunkX}-${chunkZ}-${col}-${row}`,
        );
        this.devMeshes.push(label);
      }
    }
  }

  private _makeCoordLabel(
    tileX: number,
    tileZ: number,
    worldX: number,
    worldY: number,
    worldZ: number,
    name: string,
  ): Mesh {
    const resolution = 128;
    const lineHeight = 28;
    const s = WORLD.TILE_SIZE;

    const tex = new DynamicTexture(
      `tex-${name}`,
      { width: resolution, height: resolution },
      this.scene,
    );
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
    this.navNodes = null;
  }
}
