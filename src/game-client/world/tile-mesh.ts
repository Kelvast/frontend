import { Mesh, VertexData, Scene } from "@babylonjs/core";
import { TileData, WORLD } from "kelvast-shared";
import { tileWorldY } from "./tile-height";

type TileGrid = ReadonlyArray<ReadonlyArray<TileData>>;

function cornerY(tiles: TileGrid, row: number, col: number, dr: number, dc: number): number {
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

export function buildTileMesh(
  tiles: TileGrid,
  row: number,
  col: number,
  chunkX: number,
  chunkZ: number,
  scene: Scene,
): Mesh {
  const s = WORLD.TILE_SIZE;
  const half = s / 2;

  // mesh.position is the tile centre in world space
  const worldX = (chunkX * WORLD.CHUNK_SIZE + col) * s + half;
  const worldZ = (chunkZ * WORLD.CHUNK_SIZE + row) * s + half;

  const yNW = cornerY(tiles, row, col, -1, -1);
  const yNE = cornerY(tiles, row, col, -1, 1);
  const ySW = cornerY(tiles, row, col, 1, -1);
  const ySE = cornerY(tiles, row, col, 1, 1);

  // vertices are ±half around origin so position lands on tile centre
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
  const uvs: number[] = [0, 1, 1, 1, 1, 0, 0, 0];
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
