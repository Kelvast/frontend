import { ChunkData, TileType, TileHeight } from "../types";

const TYPE_ALIAS: Record<TileType, string> = {
  [TileType.GRASS]: "G",
  [TileType.WATER]: "W",
  [TileType.STONE]: "S",
  [TileType.SAND]: "D",
  [TileType.PATH]: "P",
};

export function generateChunkTs(data: ChunkData): string {
  const usedTypes = [...new Set(data.tiles.flat().map((t) => t.type))];
  const aliases = usedTypes.map((t) => `const ${TYPE_ALIAS[t]} = tile(TileType.${t});`).join("\n");

  const rows = data.tiles
    .map((row) => {
      const cells = row.map((t) => {
        if (t.y === TileHeight.GROUND) return TYPE_ALIAS[t.type];
        const heightKey = Object.entries(TileHeight).find(([, v]) => v === t.y)?.[0];
        return `tile(TileType.${t.type}, TileHeight.${heightKey})`;
      });
      return `    [${cells.join(", ")}],`;
    })
    .join("\n");

  return `import { ChunkData, tile, TileType, TileHeight } from "../../../../types";

${aliases}

export default {
  pvp: ${data.pvp},
  tiles: [
${rows}
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;
}
