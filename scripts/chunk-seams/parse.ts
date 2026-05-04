import * as fs from "fs";
import { TileData, TileHeight, TILES, WORLD } from "mmo-shared";
import { REVERSE_TILES } from "./palette";
import { chunkFileFor } from "./discovery";
import { TileGrid } from "./types";

function buildAliasMap(src: string): Map<string, TileData> {
  const map = new Map<string, TileData>();

  /*
   * Current format: const { G, GI1, GD2, ... } = TILES;
   */
  const destructureRe = /const\s*\{([^}]+)\}\s*=\s*TILES\s*;/;
  const destructureMatch = src.match(destructureRe);
  if (destructureMatch) {
    const keys = destructureMatch[1]
      .split(",")
      .map((k) =>
        k
          .trim()
          .replace(/\/\/[^\n]*/g, "")
          .trim(),
      )
      .filter(Boolean);
    for (const key of keys) {
      const tile = (TILES as Record<string, TileData | undefined>)[key];
      if (tile) map.set(key, tile);
    }
    return map;
  }

  /*
   * Legacy format: const Grass = tileData("grass", TileHeight.SLOPE_MID);
   * These files only ever used grass so falling back to grass type is safe.
   */
  const aliasRe = /const\s+(\w+)\s*=\s*tileData\([^)]*?(?:TileHeight\.(\w+))?\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = aliasRe.exec(src)) !== null) {
    const heightName = m[2] ?? "GROUND";
    const y = TileHeight[heightName as keyof typeof TileHeight] ?? TileHeight.GROUND;
    const tilesKey = REVERSE_TILES.get(`grass:${y}`);
    if (tilesKey) {
      const tile = (TILES as Record<string, TileData | undefined>)[tilesKey];
      if (tile) map.set(m[1], tile);
    }
  }

  return map;
}

export function parseChunk(cx: number, cz: number): TileGrid | null {
  const filePath = chunkFileFor(cx, cz);
  if (!fs.existsSync(filePath)) return null;
  const src = fs.readFileSync(filePath, "utf8");

  const aliasMap = buildAliasMap(src);

  const tilesMatch = src.match(/tiles:\s*\[([\s\S]+?)\]\s*,?\s*\}\s*satisfies/);
  if (!tilesMatch) {
    console.error(`  Could not parse tiles block in ${cx}_${cz}.ts`);
    return null;
  }

  const rowRe = /\[([^\]]+)\]/g;
  const grid: TileGrid = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(tilesMatch[1])) !== null) {
    const cells = rowMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (cells.length === WORLD.CHUNK_SIZE) {
      const row = cells.map((alias) => aliasMap.get(alias));
      if (row.some((t) => t === undefined)) return null;
      grid.push(row as TileData[]);
    }
  }

  return grid.length === WORLD.CHUNK_SIZE ? grid : null;
}
