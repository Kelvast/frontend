import { Tile, TileHeight, TileData, ChunkData, TILE_META } from "mmo-shared";

const HEIGHT_KEY_MAP = Object.fromEntries(
  Object.entries(TileHeight).map(([k, v]) => [v, k]),
) as Record<number, string>;

function aliasName(t: TileData): string {
  const name = TILE_META[t.type].displayName;
  if (t.y === TileHeight.GROUND) return name;
  const heightKey = HEIGHT_KEY_MAP[t.y];
  if (!heightKey) throw new Error(`Unknown TileHeight value: ${t.y}`);
  // e.g. Stone_SLOPE_HIGH
  return `${name}_${heightKey}`;
}

function tileExpr(t: TileData): string {
  const name = TILE_META[t.type].displayName;
  if (t.y === TileHeight.GROUND) return `tileData(Tile.${name})`;
  const heightKey = HEIGHT_KEY_MAP[t.y];
  if (!heightKey) throw new Error(`Unknown TileHeight value: ${t.y}`);
  return `tileData(Tile.${name}, TileHeight.${heightKey})`;
}

export function generateChunkTs(data: ChunkData): string {
  const allTiles = data.tiles.flat();

  const usedKeys = [...new Set(allTiles.map((t) => aliasName(t)))];
  const aliasByKey = new Map<string, TileData>(
    usedKeys.map((key) => [key, allTiles.find((t) => aliasName(t) === key)!]),
  );

  const aliases = [...aliasByKey.entries()]
    .map(([key, t]) => `const ${key} = ${tileExpr(t)};`)
    .join("\n");

  const rows = data.tiles
    .map((row) => {
      const cells = row.map((t) => aliasName(t));
      return `    [${cells.join(", ")}],`;
    })
    .join("\n");

  return `import { ChunkData, tileData, Tile, TileHeight } from "mmo-shared";

${aliases}

export default {
  pvp: ${data.pvp},
  tiles: [
${rows}
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;
}
