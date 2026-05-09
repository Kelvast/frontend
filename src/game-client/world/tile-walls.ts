import { MeshBuilder, StandardMaterial, Color3, Vector3, Scene, Mesh } from "@babylonjs/core";
import { TileData, WORLD } from "kelvast-shared";
import { TILE_RENDER } from "./tile-render";
import { tileWorldY } from "./tile-height";

const NEIGHBOURS = [
  { dr: -1, dc: 0, axis: "z" as const, sign: -1 }, // north
  { dr: 1, dc: 0, axis: "z" as const, sign: 1 }, // south
  { dr: 0, dc: 1, axis: "x" as const, sign: 1 }, // east
  { dr: 0, dc: -1, axis: "x" as const, sign: -1 }, // west
] as const;

export function buildEdgeWalls(
  tiles: TileData[][],
  chunkX: number,
  chunkZ: number,
  scene: Scene,
): Mesh[] {
  const walls: Mesh[] = [];
  const half = WORLD.TILE_SIZE / 2;

  for (let row = 0; row < WORLD.CHUNK_SIZE; row++) {
    for (let col = 0; col < WORLD.CHUNK_SIZE; col++) {
      const tile = tiles[row][col];
      const tileY = tileWorldY(tile.y);
      const worldX = (chunkX * WORLD.CHUNK_SIZE + col) * WORLD.TILE_SIZE;
      const worldZ = (chunkZ * WORLD.CHUNK_SIZE + row) * WORLD.TILE_SIZE;

      for (const { dr, dc, axis, sign } of NEIGHBOURS) {
        const nr = row + dr;
        const nc = col + dc;

        // skip chunk boundary edges - no neighbour data available yet
        if (nr < 0 || nr >= WORLD.CHUNK_SIZE || nc < 0 || nc >= WORLD.CHUNK_SIZE) continue;

        const neighbourY = tileWorldY(tiles[nr][nc].y);
        if (neighbourY >= tileY) continue; // only build wall where we are higher

        const wallHeight = tileY - neighbourY;
        const wallMidY = neighbourY + wallHeight / 2;

        const wx = axis === "x" ? worldX + sign * half : worldX;
        const wz = axis === "z" ? worldZ + sign * half : worldZ;

        const mesh = MeshBuilder.CreatePlane(
          `wall-${chunkX}-${chunkZ}-${col}-${row}-${axis}${sign}`,
          {
            width: WORLD.TILE_SIZE,
            height: wallHeight,
            sideOrientation: 2, // BACKSIDE - faces inward toward the lower tile
          },
          scene,
        );

        mesh.position = new Vector3(wx, wallMidY, wz);

        // rotate to face the correct direction
        if (axis === "x") mesh.rotation.y = sign > 0 ? Math.PI / 2 : -Math.PI / 2;
        // z-axis walls face correct direction by default, just flip for south
        if (axis === "z" && sign > 0) mesh.rotation.y = Math.PI;

        mesh.isPickable = false;

        const mat = new StandardMaterial(
          `wall-mat-${chunkX}-${chunkZ}-${col}-${row}-${axis}${sign}`,
          scene,
        );
        mat.diffuseColor = TILE_RENDER[tile.type].color;
        mat.specularColor = Color3.Black();
        mat.backFaceCulling = false; // visible from both sides during development
        mesh.material = mat;

        walls.push(mesh);
      }
    }
  }

  return walls;
}
