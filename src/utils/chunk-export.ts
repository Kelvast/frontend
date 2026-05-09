import { TileData, ChunkData, TILES } from "kelvast-shared";

/*
 * Reverse map: "type:y" → TILES key (e.g. "grass:1" → "GI1").
 * Built once at module load — used by both generateChunkTs and the seam fixer.
 */
function buildTilesKeyMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [key, tile] of Object.entries(TILES as Record<string, TileData>)) {
    m.set(`${tile.type}:${tile.y}`, key);
  }
  return m;
}

const TILES_KEY_MAP = buildTilesKeyMap();

function tileKey(t: TileData): string {
  const key = TILES_KEY_MAP.get(`${t.type}:${t.y}`);
  if (!key) throw new Error(`No TILES entry for type="${t.type}" y=${t.y}`);
  return key;
}

export function generateChunkTs(data: ChunkData): string {
  const allTiles = data.tiles.flat();
  const usedKeys = [...new Set(allTiles.map(tileKey))].sort();

  const destructure = `const { ${usedKeys.join(", ")} } = TILES; // prettier-ignore`;

  /*
   * Pad each cell to the same width so columns align, then trim the trailing
   * spaces from the last cell in each row — matches the hand-authored style
   * where the final entry has no trailing whitespace before the bracket.
   */
  const colWidth = Math.max(...usedKeys.map((k) => k.length));

  const rows = data.tiles
    .map((row) => {
      const cells = row.map((t, i) => {
        const key = tileKey(t);
        return i < row.length - 1 ? key.padEnd(colWidth) : key;
      });
      return `    [ ${cells.join(", ")} ],`;
    })
    .join("\n");

  return `import { ChunkData, TILES } from "kelvast-shared";

${destructure}

export default {
  pvp: ${data.pvp},
  tiles: [
${rows}
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;
}
