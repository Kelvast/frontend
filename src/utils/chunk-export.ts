import { TileData, ChunkData, TILES } from "mmo-shared";

/*
 * Builds a reverse map from TileData identity → TILES key by comparing
 * type and y of every entry in the TILES registry.
 * Used to emit the short TILES key name rather than a tileData() call.
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

  const colWidth = Math.max(...usedKeys.map((k) => k.length));

  const rows = data.tiles
    .map((row) => {
      const cells = row.map((t) => tileKey(t).padEnd(colWidth));
      return `    [ ${cells.join(", ")} ],`;
    })
    .join("\n");

  return `import { ChunkData, TILES } from "mmo-shared";

${destructure}

export default {
  pvp: ${data.pvp},
  tiles: [
${rows}
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;
}
