import { Mesh, VertexData, Scene } from "@babylonjs/core";
import { TileData, tileWorldY, WORLD } from "mmo-shared";

function cornerY(tiles: TileData[][], row: number, col: number, dr: number, dc: number): number {
  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
  const r0 = clamp(row, tiles.length - 1);
  const c0 = clamp(col, tiles[0].length - 1);
  const r1 = clamp(row + dr, tiles.length - 1);
  const c1 = clamp(col + dc, tiles[0].length - 1);

  const samples = [tiles[r0][c0], tiles[r1][c0], tiles[r0][c1], tiles[r1][c1]];

  return samples.reduce((sum, t) => sum + tileWorldY(t.y), 0) / samples.length;
}

export function buildTileMesh(
  tiles: TileData[][],
  row: number,
  col: number,
  chunkX: number,
  chunkZ: number,
  scene: Scene,
): Mesh {
  const s = WORLD.TILE_SIZE;
  const half = s / 2;

  const worldX = (chunkX * WORLD.CHUNK_SIZE + col) * s;
  const worldZ = (chunkZ * WORLD.CHUNK_SIZE + row) * s;

  const yNW = cornerY(tiles, row, col, -1, -1);
  const yNE = cornerY(tiles, row, col, -1, 1);
  const ySW = cornerY(tiles, row, col, 1, -1);
  const ySE = cornerY(tiles, row, col, 1, 1);

  const positions = [-half, yNW, -half, half, yNE, -half, half, ySE, half, -half, ySW, half];

  const indices = [0, 1, 2, 0, 2, 3];
  const uvs = [0, 1, 1, 1, 1, 0, 0, 0];
  const normals: number[] = [];

  VertexData.ComputeNormals(positions, indices, normals);

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  const mesh = new Mesh(`tile-${chunkX}-${chunkZ}-${col}-${row}`, scene);
  vertexData.applyToMesh(mesh);

  mesh.position.x = worldX;
  mesh.position.y = 0;
  mesh.position.z = worldZ;

  return mesh;
}
