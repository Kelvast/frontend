import { Tile, TileType, TileHeight } from "../types";

const HEIGHT_FROM_KEY: Record<string, TileHeight> = Object.fromEntries(
  Object.entries(TileHeight).map(([k, v]) => [k, v as TileHeight]),
);

interface AliasMap {
  [alias: string]: Tile;
}

function parseAliases(source: string): AliasMap {
  const map: AliasMap = {};

  const shortRe = /^const (\w+) = tile\(TileType\.(\w+)\);$/gm;
  let m: RegExpExecArray | null;
  while ((m = shortRe.exec(source)) !== null) {
    const [, alias, typeName] = m;
    const type = TileType[typeName as keyof typeof TileType];
    if (type) map[alias] = { type, y: TileHeight.GROUND };
  }

  const heightRe = /^const (\w+) = tile\(TileType\.(\w+),\s*TileHeight\.(\w+)\);$/gm;
  while ((m = heightRe.exec(source)) !== null) {
    const [, alias, typeName, heightName] = m;
    const type = TileType[typeName as keyof typeof TileType];
    const y = HEIGHT_FROM_KEY[heightName];
    if (type && y !== undefined) map[alias] = { type, y };
  }

  return map;
}

function parseInlineTile(expr: string, aliases: AliasMap): Tile | null {
  const trimmed = expr.trim();

  if (aliases[trimmed]) return aliases[trimmed];

  const m = trimmed.match(/^tile\(TileType\.(\w+)(?:,\s*TileHeight\.(\w+))?\)$/);
  if (m) {
    const type = TileType[m[1] as keyof typeof TileType];
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

export function parseChunkTs(source: string): { tiles: Tile[][]; pvp: boolean } | null {
  try {
    const aliases = parseAliases(source);

    const tilesBlock = extractTilesBlock(source);
    if (!tilesBlock) return null;

    const pvpMatch = source.match(/pvp:\s*(true|false)/);
    const pvp = pvpMatch?.[1] === "true";

    const rowRe = /\[([^\]]+)\]/g;
    const tiles: Tile[][] = [];
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRe.exec(tilesBlock)) !== null) {
      const cells = rowMatch[1].split(",").map((c) => parseInlineTile(c, aliases));
      if (cells.some((c) => c === null)) return null;
      tiles.push(cells as Tile[]);
    }

    return { tiles, pvp };
  } catch {
    return null;
  }
}
