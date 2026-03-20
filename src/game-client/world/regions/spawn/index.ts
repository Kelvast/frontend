import { Region, ChunkData } from "../../../../types";

const ctx: RequireContext = require.context(".", false, /^\.\/((?!index)\d+-\d+)\.ts$/);

function parseCoords(key: string): [number, number] {
  const [x, z] = key.replace("./", "").replace(".ts", "").split("-").map(Number);
  return [x, z];
}

function buildChunkEntry(key: string): [string, ChunkData] {
  const [x, z] = parseCoords(key);
  return [`${x},${z}`, { ...ctx(key).default, chunkX: x, chunkZ: z, region: "spawn" }];
}

export function buildRegion(): Region {
  return {
    id: "spawn",
    name: "Spawn",
    chunks: Object.fromEntries(ctx.keys().map(buildChunkEntry)),
  };
}

export default buildRegion();
