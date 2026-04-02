import { TileHeight, ChunkData, TILE_META } from "mmo-shared";

export function generateChunkTs(data: ChunkData): string {
  const usedTypes = [...new Set(data.tiles.flat().map((t) => t.type))];

  const aliases = usedTypes
    .map((t) => `const ${TILE_META[t].displayName} = tileData(Tile.${TILE_META[t].displayName});`)
    .join("\n");

  const rows = data.tiles
    .map((row) => {
      const cells = row.map((t) => {
        if (t.y === TileHeight.GROUND) return TILE_META[t.type].displayName;
        const heightKey = Object.entries(TileHeight).find(([, v]) => v === t.y)?.[0];
        return `tileData(Tile.${TILE_META[t.type].displayName}, TileHeight.${heightKey})`;
      });
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
