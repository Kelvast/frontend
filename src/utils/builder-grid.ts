import { ChunkData, Region } from "mmo-shared";

export interface GridCell {
  chunkX: number;
  chunkZ: number;
  chunk: ChunkData | null;
}

export function buildWorldGrid(regions: Region[]): GridCell[][] {
  const allChunks = regions.flatMap((r) => Object.values(r.chunks));
  if (allChunks.length === 0) return [];

  const xs = allChunks.map((c) => c.chunkX);
  const zs = allChunks.map((c) => c.chunkZ);
  const minX = Math.min(...xs) - 1;
  const maxX = Math.max(...xs) + 1;
  const minZ = Math.min(...zs) - 1;
  const maxZ = Math.max(...zs) + 1;

  const index = new Map(allChunks.map((c) => [`${c.chunkX},${c.chunkZ}`, c]));

  return Array.from({ length: maxZ - minZ + 1 }, (_, zi) =>
    Array.from({ length: maxX - minX + 1 }, (_, xi) => {
      const chunkX = minX + xi;
      const chunkZ = minZ + zi;
      return { chunkX, chunkZ, chunk: index.get(`${chunkX},${chunkZ}`) ?? null };
    }),
  );
}
