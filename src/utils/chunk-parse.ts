import { TileType, TileData, TileHeight, TILE_WALKABLE, tileData } from "mmo-shared";

const HEIGHT_FROM_KEY: Record<string, TileHeight> = Object.fromEntries(
  Object.entries(TileHeight)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => [k, v as TileHeight]),
);

function isTileType(value: string): value is TileType {
  return value in TILE_WALKABLE;
}

type AliasMap = Record<string, TileData>;

function parseAliases(source: string): AliasMap {
  const map: AliasMap = {};

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

export function parseChunkTs(source: string): { tiles: TileData[][]; pvp: boolean } | null {
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

    return { tiles, pvp };
  } catch {
    return null;
  }
}
