import { TileHeight, TileData, ChunkData } from "mmo-shared";

const HEIGHT_KEY_MAP = Object.fromEntries(
  Object.entries(TileHeight)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => [v, k]),
) as Record<number, string>;

function displayName(type: string): string {
  return type[0].toUpperCase() + type.slice(1);
}

function aliasName(t: TileData): string {
  const name = displayName(t.type);
  if (t.y === TileHeight.GROUND) return name;
  const heightKey = HEIGHT_KEY_MAP[t.y];
  if (!heightKey) throw new Error(`Unknown TileHeight value: ${t.y}`);
  return `${name}_${heightKey}`;
}

function tileExpr(t: TileData): string {
  if (t.y === TileHeight.GROUND) return `tileData("${t.type}")`;
  const heightKey = HEIGHT_KEY_MAP[t.y];
  if (!heightKey) throw new Error(`Unknown TileHeight value: ${t.y}`);
  return `tileData("${t.type}", TileHeight.${heightKey})`;
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

  return `import { ChunkData, tileData, TileHeight } from "mmo-shared";

${aliases}

export default {
  pvp: ${data.pvp},
  tiles: [
${rows}
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;
}
