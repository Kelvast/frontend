import * as fs from "fs";
import * as path from "path";
import { ChunkCoord } from "./types";

export const REGIONS_DIR = path.resolve(process.cwd(), "src/game-client/world/regions/spawn");

export function chunkFileFor(cx: number, cz: number): string {
  const name = cx < 0 ? `-${Math.abs(cx)}_${cz}` : `${cx}_${cz}`;
  return path.join(REGIONS_DIR, `${name}.ts`);
}

export function discoverChunks(): ChunkCoord[] {
  return fs
    .readdirSync(REGIONS_DIR)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => {
      const base = f.replace(".ts", "");
      const [rawX, rawZ] = base.split("_");
      const cx = rawX.startsWith("-") ? -parseInt(rawX.slice(1), 10) : parseInt(rawX, 10);
      const cz = parseInt(rawZ, 10);
      return [cx, cz] as ChunkCoord;
    });
}
