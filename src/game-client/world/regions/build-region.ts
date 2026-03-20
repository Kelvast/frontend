import { Region, ChunkData } from "../../../types";

export function buildRegionFromContext(
  ctx: RequireContext,
  id: string,
  name: string,
): Region {
  const chunks = Object.fromEntries(
    ctx.keys().map((key: string) => {
      const [x, z] = key.replace("./", "").replace(".ts", "").split("-").map(Number);
      return [`${x},${z}`, { ...ctx(key).default, chunkX: x, chunkZ: z, region: id } as ChunkData];
    }),
  );

  return { id, name, chunks };
}
