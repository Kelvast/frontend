#!/usr/bin/env node
/**
 * Diagnostic tool for chunk border height mismatches.
 *
 * Usage:
 *   npx tsx scripts/check-chunk-seams.ts          — report mismatches only
 *   npx tsx scripts/check-chunk-seams.ts --fix     — rewrite mismatched border tiles
 *
 * When --fix is used, the tile on the LOWER-indexed chunk side of each seam
 * is snapped to match its neighbour. Heights in the files are the sole source
 * of truth — the fix writes the minimum change needed to remove the gap.
 *
 * Only border tiles (the outermost row/col of each chunk) are ever touched.
 * Interior tiles are never modified.
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const CHUNK_SIZE = 16;
const FIX_MODE = process.argv.includes("--fix");

const HEIGHT_VALUE: Record<string, number> = {
  GROUND: 0,
  SLOPE_LOW: 1,
  SLOPE_LOW_MID: 2,
  SLOPE_MID: 3,
  SLOPE_MID_HIGH: 4,
  SLOPE_HIGH: 5,
  FIRST_FLOOR: 6,
  SECOND_FLOOR: 7,
  THIRD_FLOOR: 8,
};

const HEIGHT_NAME: Record<number, string> = Object.fromEntries(
  Object.entries(HEIGHT_VALUE).map(([k, v]) => [v, k]),
);

const REGIONS_DIR = path.resolve(
  process.cwd(),
  "src/game-client/world/regions/spawn",
);

// ── Chunk file discovery ─────────────────────────────────────────────────────

function chunkFileFor(cx: number, cz: number): string {
  const name = cx < 0 ? `-${Math.abs(cx)}_${cz}` : `${cx}_${cz}`;
  return path.join(REGIONS_DIR, `${name}.ts`);
}

function discoverChunks(): [number, number][] {
  return fs
    .readdirSync(REGIONS_DIR)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => {
      const base = f.replace(".ts", "");
      const [rawX, rawZ] = base.split("_");
      const cx = rawX.startsWith("-") ? -parseInt(rawX.slice(1), 10) : parseInt(rawX, 10);
      const cz = parseInt(rawZ, 10);
      return [cx, cz] as [number, number];
    });
}

// ── Parse chunk source ───────────────────────────────────────────────────────

function parseChunk(cx: number, cz: number): number[][] | null {
  const filePath = chunkFileFor(cx, cz);
  if (!fs.existsSync(filePath)) return null;
  const src = fs.readFileSync(filePath, "utf8");

  // Build alias -> height map from lines like:
  //   const Grass_SLOPE_MID = tileData("grass", TileHeight.SLOPE_MID);
  //   const Grass = tileData("grass");
  const aliasMap = new Map<string, number>();
  const aliasRe =
    /const\s+(\w+)\s*=\s*tileData\([^)]*?(?:TileHeight\.(\w+))?\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = aliasRe.exec(src)) !== null) {
    aliasMap.set(m[1], HEIGHT_VALUE[m[2] ?? "GROUND"] ?? 0);
  }

  // Extract tiles array
  const tilesMatch = src.match(/tiles:\s*\[([\s\S]+?)\]\s*,?\s*\}\s*satisfies/);
  if (!tilesMatch) {
    console.error(`  Could not parse tiles block in ${cx}_${cz}.ts`);
    return null;
  }

  const rowRe = /\[([^\]]+)\]/g;
  const grid: number[][] = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(tilesMatch[1])) !== null) {
    const cells = rowMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (cells.length === CHUNK_SIZE) {
      grid.push(cells.map((alias) => aliasMap.get(alias) ?? 0));
    }
  }

  return grid.length === CHUNK_SIZE ? grid : null;
}

// ── Seam checking ────────────────────────────────────────────────────────────

interface Mismatch {
  chunkA: [number, number];
  chunkB: [number, number];
  edge: "east-west" | "south-north";
  index: number; // col (east-west seam) or row (south-north seam)
  heightA: number;
  heightB: number;
}

function checkSeams(
  chunks: Map<string, number[][]>,
  coords: [number, number][],
): Mismatch[] {
  const mismatches: Mismatch[] = [];
  const key = (cx: number, cz: number) => `${cx},${cz}`;

  for (const [cx, cz] of coords) {
    const gridA = chunks.get(key(cx, cz));
    if (!gridA) continue;

    // Check east seam (col 15 of A vs col 0 of B at cx+1)
    const gridE = chunks.get(key(cx + 1, cz));
    if (gridE) {
      for (let row = 0; row < CHUNK_SIZE; row++) {
        const hA = gridA[row][CHUNK_SIZE - 1];
        const hB = gridE[row][0];
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

    // Check south seam (row 15 of A vs row 0 of B at cz+1)
    const gridS = chunks.get(key(cx, cz + 1));
    if (gridS) {
      for (let col = 0; col < CHUNK_SIZE; col++) {
        const hA = gridA[CHUNK_SIZE - 1][col];
        const hB = gridS[0][col];
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

// ── Fix: rewrite chunk file with corrected border tiles ───────────────────────

function applyFixes(
  mismatches: Mismatch[],
  chunks: Map<string, number[][]>,
): Set<string> {
  const dirty = new Set<string>();
  const key = (cx: number, cz: number) => `${cx},${cz}`;

  for (const m of mismatches) {
    const [ax, az] = m.chunkA;
    const [bx, bz] = m.chunkB;
    const gridA = chunks.get(key(ax, az))!;
    const gridB = chunks.get(key(bx, bz))!;

    if (m.edge === "east-west") {
      // Snap A's east border tile to match B's west border tile
      gridA[m.index][CHUNK_SIZE - 1] = m.heightB;
      dirty.add(key(ax, az));
    } else {
      // Snap A's south border tile to match B's north border tile
      gridA[CHUNK_SIZE - 1][m.index] = m.heightB;
      dirty.add(key(ax, az));
    }
  }

  return dirty;
}

// ── Write chunk file ─────────────────────────────────────────────────────────

function writeChunk(cx: number, cz: number, grid: number[][], srcTemplate: string): void {
  // Rebuild alias map from what heights are actually used
  const usedHeights = new Set(grid.flat());

  // Detect the tile type prefix from the existing file (e.g. "Grass")
  const prefixMatch = srcTemplate.match(/const\s+(\w+)\s*=\s*tileData\("(\w+)"\s*\)/);
  const tileType = prefixMatch ? prefixMatch[1] : "Grass";
  const tileTexture = prefixMatch ? prefixMatch[2] : "grass";

  const aliasLines: string[] = [];
  aliasLines.push(`const ${tileType} = tileData("${tileTexture}");`);
  for (const h of [1, 2, 3, 4, 5, 6, 7, 8]) {
    if (usedHeights.has(h)) {
      aliasLines.push(
        `const ${tileType}_${HEIGHT_NAME[h]} = tileData("${tileTexture}", TileHeight.${HEIGHT_NAME[h]});`,
      );
    }
  }

  const alias = (h: number) => (h === 0 ? tileType : `${tileType}_${HEIGHT_NAME[h]}`);

  const rows = grid
    .map((row) => {
      const cells = row.map((h) => `      ${alias(h)},`).join("\n");
      return `    [\n${cells}\n    ]`;
    })
    .join(",\n");

  const out = `import { ChunkData, tileData, TileHeight } from "mmo-shared";

${aliasLines.join("\n")}

export default {
  pvp: false,
  tiles: [
${rows},
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;

  fs.writeFileSync(chunkFileFor(cx, cz), out, "utf8");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\n🗺  Chunk seam checker — ${FIX_MODE ? "FIX mode" : "report only"}\n`);

  const coords = discoverChunks();
  console.log(`Found ${coords.length} chunk(s): ${coords.map(([x, z]) => `(${x},${z})`).join(" ")}\n`);

  const chunks = new Map<string, number[][]>();
  const sources = new Map<string, string>();
  for (const [cx, cz] of coords) {
    const grid = parseChunk(cx, cz);
    if (!grid) {
      console.error(`✗ Failed to parse chunk (${cx}, ${cz})`);
      process.exit(1);
    }
    chunks.set(`${cx},${cz}`, grid);
    sources.set(`${cx},${cz}`, fs.readFileSync(chunkFileFor(cx, cz), "utf8"));
  }

  const mismatches = checkSeams(chunks, coords);

  if (mismatches.length === 0) {
    console.log("✅ No seam mismatches found — all chunk borders match.");
    return;
  }

  console.log(`⚠️  Found ${mismatches.length} mismatch(es):\n`);
  for (const m of mismatches) {
    const [ax, az] = m.chunkA;
    const [bx, bz] = m.chunkB;
    const side = m.edge === "east-west"
      ? `chunk (${ax},${az}) col 15 / chunk (${bx},${bz}) col 0  [row ${m.index}]`
      : `chunk (${ax},${az}) row 15 / chunk (${bx},${bz}) row 0  [col ${m.index}]`;
    console.log(
      `  ${side}\n    (${ax},${az}): ${HEIGHT_NAME[m.heightA]} (${m.heightA})  →  (${bx},${bz}): ${HEIGHT_NAME[m.heightB]} (${m.heightB})`,
    );
  }

  if (!FIX_MODE) {
    console.log("\nRun with --fix to snap mismatched border tiles to their neighbour's height.");
    return;
  }

  // Confirm before writing
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((resolve) => {
    rl.question(`\nFix ${mismatches.length} tile(s)? [y/N] `, (answer) => {
      rl.close();
      if (answer.toLowerCase() !== "y") {
        console.log("Aborted.");
        process.exit(0);
      }
      resolve();
    });
  });

  const dirty = applyFixes(mismatches, chunks);

  for (const k of dirty) {
    const [cx, cz] = k.split(",").map(Number) as [number, number];
    const grid = chunks.get(k)!;
    const src = sources.get(k)!;
    writeChunk(cx, cz, grid, src);
    console.log(`  ✓ Rewrote (${cx}, ${cz})`);
  }

  console.log("\nDone. Re-run without --fix to verify.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
