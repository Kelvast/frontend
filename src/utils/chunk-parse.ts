import { Tile, TileType, TileData, TileHeight } from "mmo-shared";

const HEIGHT_FROM_KEY: Record<string, TileHeight> = Object.fromEntries(
  Object.entries(TileHeight).map(([k, v]) => [k, v as TileHeight]),
);

type AliasMap = Record<string, TileData>;

function parseAliases(source: string): AliasMap {
  const map: AliasMap = {};

  const shortRe = /^const (\w+) = tileData\(Tile\.(\w+)\);$/gm;
  let m: RegExpExecArray | null;
  while ((m = shortRe.exec(source)) !== null) {
    const [, alias, tileName] = m;
    const type = Tile[tileName as keyof typeof Tile] as TileType | undefined;
    if (type) map[alias] = { type, y: TileHeight.GROUND };
  }

  const heightRe = /^const (\w+) = tileData\(Tile\.(\w+),\s*TileHeight\.(\w+)\);$/gm;
  while ((m = heightRe.exec(source)) !== null) {
    const [, alias, tileName, heightName] = m;
    const type = Tile[tileName as keyof typeof Tile] as TileType | undefined;
    const y = HEIGHT_FROM_KEY[heightName];
    if (type && y !== undefined) map[alias] = { type, y };
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

  const m = trimmed.match(/^tileData\(Tile\.(\w+)(?:,\s*TileHeight\.(\w+))?\)$/);
  if (m) {
    const type = Tile[m[1] as keyof typeof Tile] as TileType | undefined;
    const y = m[2] ? HEIGHT_FROM_KEY[m[2]] : TileHeight.GROUND;
    if (type && y !== undefined) return { type, y };
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
