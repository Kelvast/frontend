import * as fs from "fs";
import { tileKey } from "./palette";
import { chunkFileFor } from "./discovery";
import { TileGrid } from "./types";

export function writeChunk(cx: number, cz: number, grid: TileGrid): void {
  const usedKeys = [...new Set(grid.flat().map(tileKey))].sort();
  const colWidth = Math.max(...usedKeys.map((k) => k.length));

  const destructure = `const { ${usedKeys.join(", ")} } = TILES; // prettier-ignore`;

  const rows = grid
    .map((row) => {
      const cells = row.map((t, i) => {
        const k = tileKey(t);
        return i < row.length - 1 ? k.padEnd(colWidth) : k;
      });
      return `    [ ${cells.join(", ")} ],`;
    })
    .join("\n");

  const out = `import { ChunkData, TILES } from "mmo-shared";

${destructure}

export default {
  pvp: false,
  tiles: [
${rows}
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;

  fs.writeFileSync(chunkFileFor(cx, cz), out, "utf8");
}
