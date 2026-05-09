import { TileType, TileData, TileHeight, TILE_WALKABLE, tileData, TILES } from "kelvast-shared";
import type { ObjectInstance, NpcSpawn } from "kelvast-shared";

const HEIGHT_FROM_KEY = Object.fromEntries(
  Object.entries(TileHeight)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => [k, v as TileHeight]),
) as Record<string, TileHeight>;

function isTileType(value: string): value is TileType {
  return value in TILE_WALKABLE;
}

type AliasMap = Record<string, TileData>;

/*
 * Handles three alias declaration styles that may appear in chunk files:
 *
 * 1. TILES destructure (current style):
 *      const { G, GI1, GI2, ... } = TILES;
 *    Each key is looked up directly in the live TILES object.
 *
 * 2. tileData short form (legacy):
 *      const G = tileData("grass");
 *
 * 3. tileData with height (legacy):
 *      const GI1 = tileData("grass", TileHeight.SLOPE_LOW);
 */
function parseAliases(source: string): AliasMap {
  const map: AliasMap = {};

  const destructureRe = /const\s*\{([^}]+)\}\s*=\s*TILES\s*;/;
  const destructureMatch = source.match(destructureRe);
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
      if (tile) map[key] = tile;
    }
    return map;
  }

  const shortRe = /^const (\w+) = tileData\("(\w+)"\);$/gm;
  let m: RegExpExecArray | null;
  while ((m = shortRe.exec(source)) !== null) {
    const [, alias, typeName] = m;
    if (isTileType(typeName)) map[alias] = tileData(typeName);
  }

  const heightRe = /^const (\w+) = tileData\("(\w+)",\s*TileHeight\.(\w+)\);$/gm;
  while ((m = heightRe.exec(source)) !== null) {
    const [, alias, typeName, heightName] = m;
    const y = HEIGHT_FROM_KEY[heightName];
    if (isTileType(typeName) && y !== undefined) map[alias] = tileData(typeName, y);
  }

  return map;
}

function splitCells(row: string): string[] {
  const cells: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of row) {
    if (char === "(") depth++;
    else if (char === ")") depth--;

    if (char === "," && depth === 0) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) cells.push(current.trim());
  return cells;
}

function parseInlineTile(expr: string, aliases: AliasMap): TileData | null {
  const trimmed = expr.trim();

  if (aliases[trimmed]) return aliases[trimmed];

  const m = trimmed.match(/^tileData\("(\w+)"(?:,\s*TileHeight\.(\w+))?\)$/);
  if (m) {
    const y = m[2] ? HEIGHT_FROM_KEY[m[2]] : TileHeight.GROUND;
    if (isTileType(m[1]) && y !== undefined) return tileData(m[1], y);
  }

  return null;
}

function extractTilesBlock(source: string): string | null {
  const start = source.indexOf("tiles:");
  if (start === -1) return null;
  const bracketStart = source.indexOf("[", start);
  if (bracketStart === -1) return null;

  let depth = 0;
  for (let i = bracketStart; i < source.length; i++) {
    if (source[i] === "[") depth++;
    else if (source[i] === "]") {
      depth--;
      if (depth === 0) return source.slice(bracketStart + 1, i);
    }
  }
  return null;
}

export interface ParsedChunk {
  tiles: TileData[][];
  pvp: boolean;
  objects: ObjectInstance[];
  npcSpawns: NpcSpawn[];
}

/*
 * Parses a chunk .ts source file into structured data.
 *
 * objects and npcSpawns are not stored in chunk files - they live in the
 * region index. This parser always returns empty arrays for both fields so
 * callers get a complete ParsedChunk shape without needing to handle
 * undefined. The route handler preserves the existing values from disk rather
 * than relying on these parsed values.
 */
export function parseChunkTs(source: string): ParsedChunk | null {
  try {
    const aliases = parseAliases(source);
    const tilesBlock = extractTilesBlock(source);
    if (!tilesBlock) return null;

    const pvpMatch = source.match(/pvp:\s*(true|false)/);
    const pvp = pvpMatch?.[1] === "true";

    const rowRe = /\[([^\]]+)\]/g;
    const tiles: TileData[][] = [];
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRe.exec(tilesBlock)) !== null) {
      const cells = splitCells(rowMatch[1]).map((c) => parseInlineTile(c, aliases));
      if (cells.some((c) => c === null)) return null;
      tiles.push(cells as TileData[]);
    }

    return { tiles, pvp, objects: [], npcSpawns: [] };
  } catch {
    return null;
  }
}
