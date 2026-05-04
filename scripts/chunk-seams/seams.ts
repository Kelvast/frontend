import { withHeight } from "./palette";
import { CHUNK_SIZE, type ChunkCoord, type Mismatch, type TileGrid } from "./types";

export function checkSeams(chunks: Map<string, TileGrid>, coords: ChunkCoord[]): Mismatch[] {
  const mismatches: Mismatch[] = [];
  const key = (cx: number, cz: number) => `${cx},${cz}`;

  for (const [cx, cz] of coords) {
    const gridA = chunks.get(key(cx, cz));
    if (!gridA) continue;

    const gridE = chunks.get(key(cx + 1, cz));
    if (gridE) {
      for (let row = 0; row < CHUNK_SIZE; row++) {
        const hA = gridA[row][CHUNK_SIZE - 1].y;
        const hB = gridE[row][0].y;
        if (hA !== hB) {
          mismatches.push({
            chunkA: [cx, cz],
            chunkB: [cx + 1, cz],
            edge: "east-west",
            index: row,
            heightA: hA,
            heightB: hB,
          });
        }
      }
    }

    const gridS = chunks.get(key(cx, cz + 1));
    if (gridS) {
      for (let col = 0; col < CHUNK_SIZE; col++) {
        const hA = gridA[CHUNK_SIZE - 1][col].y;
        const hB = gridS[0][col].y;
        if (hA !== hB) {
          mismatches.push({
            chunkA: [cx, cz],
            chunkB: [cx, cz + 1],
            edge: "south-north",
            index: col,
            heightA: hA,
            heightB: hB,
          });
        }
      }
    }
  }

  return mismatches;
}

export function applyFixes(mismatches: Mismatch[], chunks: Map<string, TileGrid>): Set<string> {
  const dirty = new Set<string>();
  const key = (cx: number, cz: number) => `${cx},${cz}`;

  for (const m of mismatches) {
    const [ax, az] = m.chunkA;
    const gridA = chunks.get(key(ax, az))!;

    if (m.edge === "east-west") {
      gridA[m.index][CHUNK_SIZE - 1] = withHeight(gridA[m.index][CHUNK_SIZE - 1], m.heightB);
    } else {
      gridA[CHUNK_SIZE - 1][m.index] = withHeight(gridA[CHUNK_SIZE - 1][m.index], m.heightB);
    }
    dirty.add(key(ax, az));
  }

  return dirty;
}
