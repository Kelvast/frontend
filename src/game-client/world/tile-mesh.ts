import { Mesh, VertexData, Scene } from "@babylonjs/core";
import { TileData, TileHeight, WORLD } from "mmo-shared";
import { tileWorldY } from "./tile-height";

type TileGrid = ReadonlyArray<ReadonlyArray<TileData>>;

/*
 * Samples the world-space Y at each corner of a tile using absolute tile coords.
 * Each corner is the average of the four tiles that share it — this is standard
 * vertex-sharing geometry that makes adjacent tiles connect smoothly within the
 * same authored terrain. Heights come directly from the tile map with no
 * modification; the chunk files are the sole source of truth for elevation.
 */
function cornerY(
  absTileX: number,
  absTileZ: number,
  dr: number,
  dc: number,
  getRegionTile: (tileX: number, tileZ: number) => TileData | null,
): number {
  const heights = [
    tileWorldY(getRegionTile(absTileX,      absTileZ     )?.y ?? TileHeight.GROUND),
    tileWorldY(getRegionTile(absTileX,      absTileZ + dr)?.y ?? TileHeight.GROUND),
    tileWorldY(getRegionTile(absTileX + dc, absTileZ     )?.y ?? TileHeight.GROUND),
    tileWorldY(getRegionTile(absTileX + dc, absTileZ + dr)?.y ?? TileHeight.GROUND),
  ];
  return heights.reduce((sum, h) => sum + h, 0) / heights.length;
}

export function buildTileMesh(
  tiles: TileGrid,
  row: number,
  col: number,
  chunkX: number,
  chunkZ: number,
  scene: Scene,
  getRegionTile: (tileX: number, tileZ: number) => TileData | null,
): Mesh {
  const s = WORLD.TILE_SIZE;
  const half = s / 2;

  const absTileX = chunkX * WORLD.CHUNK_SIZE + col;
  const absTileZ = chunkZ * WORLD.CHUNK_SIZE + row;
  const worldX = absTileX * s + half;
  const worldZ = absTileZ * s + half;

  const yNW = cornerY(absTileX, absTileZ, -1, -1, getRegionTile);
  const yNE = cornerY(absTileX, absTileZ, -1,  1, getRegionTile);
  const ySW = cornerY(absTileX, absTileZ,  1, -1, getRegionTile);
  const ySE = cornerY(absTileX, absTileZ,  1,  1, getRegionTile);

  const positions: number[] = [
    -half, yNW, -half,
     half, yNE, -half,
     half, ySE,  half,
    -half, ySW,  half,
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
