import { TileData, TileHeight, TILES } from "mmo-shared";

function buildReverseMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [key, tile] of Object.entries(TILES as Record<string, TileData>)) {
    m.set(`${tile.type}:${tile.y}`, key);
  }
  return m;
}

export const REVERSE_TILES = buildReverseMap();

export function tileKey(t: TileData): string {
  const key = REVERSE_TILES.get(`${t.type}:${t.y}`);
  if (!key) throw new Error(`No TILES entry for type="${t.type}" y=${t.y}`);
  return key;
}

/*
 * Returns the TILES entry that matches `existing`'s type at `targetHeight`.
 * Preserves tile type — only the height changes.
 */
export function withHeight(existing: TileData, targetHeight: TileHeight): TileData {
  const key = REVERSE_TILES.get(`${existing.type}:${targetHeight}`);
  if (!key) throw new Error(`No TILES entry for type="${existing.type}" y=${targetHeight}`);
  const tile = (TILES as Record<string, TileData | undefined>)[key];
  if (!tile) throw new Error(`TILES key "${key}" missing`);
  return tile;
}
