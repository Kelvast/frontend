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
import { TileHeight, TileData, TILES } from "mmo-shared";

const CHUNK_SIZE = 16;
const FIX_MODE = process.argv.includes("--fix");

const HEIGHT_NAME = Object.fromEntries(
  Object.entries(TileHeight)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => [v as number, k]),
) as Record<number, string>;

const REGIONS_DIR = path.resolve(process.cwd(), "src/game-client/world/regions/spawn");

type ChunkCoord = [number, number];
type HeightGrid = TileHeight[][];

// ── Chunk file discovery ─────────────────────────────────────────────────────

function chunkFileFor(cx: number, cz: number): string {
  const name = cx < 0 ? `-${Math.abs(cx)}_${cz}` : `${cx}_${cz}`;
  return path.join(REGIONS_DIR, `${name}.ts`);
}

function discoverChunks(): ChunkCoord[] {
  return fs
    .readdirSync(REGIONS_DIR)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => {
      const base = f.replace(".ts", "");
      const [rawX, rawZ] = base.split("_");
      const cx = rawX.startsWith("-") ? -parseInt(rawX.slice(1), 10) : parseInt(rawX, 10);
      const cz = parseInt(rawZ, 10);
      return [cx, cz] as ChunkCoord;
    });
}

// ── Parse chunk source ───────────────────────────────────────────────────────

function buildAliasMap(src: string): Map<string, TileHeight> {
  const map = new Map<string, TileHeight>();

  /*
   * Current format: const { G, GI1, GI2, ... } = TILES;
   * Look each key up in the live TILES object to get its height.
   */
  const destructureRe = /const\s*\{([^}]+)\}\s*=\s*TILES\s*;/;
  const destructureMatch = src.match(destructureRe);
  if (destructureMatch) {
    const keys = destructureMatch[1]
      .split(",")
      .map((k) => k.trim().replace(/\/\/[^\n]*/g, "").trim())
      .filter(Boolean);
    for (const key of keys) {
      const tile = (TILES as Record<string, TileData | undefined>)[key];
      if (tile) map.set(key, tile.y);
    }
    return map;
  }

  /*
   * Legacy format: const Grass = tileData("grass");
   *                const Grass_SLOPE_MID = tileData("grass", TileHeight.SLOPE_MID);
   */
  const aliasRe = /const\s+(\w+)\s*=\s*tileData\([^)]*?(?:TileHeight\.(\w+))?\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = aliasRe.exec(src)) !== null) {
    const heightName = m[2] ?? "GROUND";
    map.set(m[1], TileHeight[heightName as keyof typeof TileHeight] ?? TileHeight.GROUND);
  }

  return map;
}

function parseChunk(cx: number, cz: number): HeightGrid | null {
  const filePath = chunkFileFor(cx, cz);
  if (!fs.existsSync(filePath)) return null;
  const src = fs.readFileSync(filePath, "utf8");

  const aliasMap = buildAliasMap(src);

  const tilesMatch = src.match(/tiles:\s*\[([\s\S]+?)\]\s*,?\s*\}\s*satisfies/);
  if (!tilesMatch) {
    console.error(`  Could not parse tiles block in ${cx}_${cz}.ts`);
    return null;
  }

  const rowRe = /\[([^\]]+)\]/g;
  const grid: HeightGrid = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(tilesMatch[1])) !== null) {
    const cells = rowMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (cells.length === CHUNK_SIZE) {
      grid.push(cells.map((alias) => aliasMap.get(alias) ?? TileHeight.GROUND));
    }
  }

  return grid.length === CHUNK_SIZE ? grid : null;
}

// ── Seam checking ────────────────────────────────────────────────────────────

interface Mismatch {
  chunkA: ChunkCoord;
  chunkB: ChunkCoord;
  edge: "east-west" | "south-north";
  index: number;
  heightA: TileHeight;
  heightB: TileHeight;
}

function checkSeams(chunks: Map<string, HeightGrid>, coords: ChunkCoord[]): Mismatch[] {
  const mismatches: Mismatch[] = [];
  const key = (cx: number, cz: number) => `${cx},${cz}`;

  for (const [cx, cz] of coords) {
    const gridA = chunks.get(key(cx, cz));
    if (!gridA) continue;

    const gridE = chunks.get(key(cx + 1, cz));
    if (gridE) {
      for (let row = 0; row < CHUNK_SIZE; row++) {
        const hA = gridA[row][CHUNK_SIZE - 1];
        const hB = gridE[row][0];
        if (hA !== hB) {
          mismatches.push({ chunkA: [cx, cz], chunkB: [cx + 1, cz], edge: "east-west", index: row, heightA: hA, heightB: hB });
        }
      }
    }

    const gridS = chunks.get(key(cx, cz + 1));
    if (gridS) {
      for (let col = 0; col < CHUNK_SIZE; col++) {
        const hA = gridA[CHUNK_SIZE - 1][col];
        const hB = gridS[0][col];
        if (hA !== hB) {
          mismatches.push({ chunkA: [cx, cz], chunkB: [cx, cz + 1], edge: "south-north", index: col, heightA: hA, heightB: hB });
        }
      }
    }
  }

  return mismatches;
}

// ── Fix ──────────────────────────────────────────────────────────────────────

function applyFixes(mismatches: Mismatch[], chunks: Map<string, HeightGrid>): Set<string> {
  const dirty = new Set<string>();
  const key = (cx: number, cz: number) => `${cx},${cz}`;

  for (const m of mismatches) {
    const [ax, az] = m.chunkA;
    const gridA = chunks.get(key(ax, az))!;

    if (m.edge === "east-west") {
      gridA[m.index][CHUNK_SIZE - 1] = m.heightB;
    } else {
      gridA[CHUNK_SIZE - 1][m.index] = m.heightB;
    }
    dirty.add(key(ax, az));
  }

  return dirty;
}

// ── Write chunk file ─────────────────────────────────────────────────────────

/*
 * Builds a reverse map from TileHeight value + type → TILES key.
 * We need to know what tile type the original chunk used so the fixed file
 * stays consistent. We infer it from the first tile in the grid.
 */
function buildReverseMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [key, tile] of Object.entries(TILES as Record<string, TileData>)) {
    m.set(`${tile.type}:${tile.y}`, key);
  }
  return m;
}

const REVERSE_TILES = buildReverseMap();

function writeChunk(cx: number, cz: number, grid: HeightGrid, srcTemplate: string): void {
  /*
   * Infer the tile type used by this chunk from the existing TILES destructure
   * or the first legacy alias declaration. Fall back to "grass" if unreadable.
   */
  let dominantType = "grass";
  const destructureRe = /const\s*\{([^}]+)\}\s*=\s*TILES\s*;/;
  const destructureMatch = srcTemplate.match(destructureRe);
  if (destructureMatch) {
    const firstKey = destructureMatch[1]
      .split(",")
      .map((k) => k.trim().replace(/\/\/[^\n]*/g, "").trim())
      .find(Boolean);
    if (firstKey) {
      const tile = (TILES as Record<string, TileData | undefined>)[firstKey];
      if (tile) dominantType = tile.type;
    }
  } else {
    const legacyMatch = srcTemplate.match(/tileData\("(\w+)"/);
    if (legacyMatch) dominantType = legacyMatch[1];
  }

  const tilesKeyFor = (h: TileHeight): string => {
    const key = REVERSE_TILES.get(`${dominantType}:${h}`);
    if (!key) throw new Error(`No TILES entry for type="${dominantType}" y=${h}`);
    return key;
  };

  const usedKeys = [...new Set(grid.flat().map(tilesKeyFor))].sort();
  const colWidth = Math.max(...usedKeys.map((k) => k.length));

  const destructure = `const { ${usedKeys.join(", ")} } = TILES; // prettier-ignore`;

  const rows = grid
    .map((row) => {
      const cells = row.map((h) => tilesKeyFor(h).padEnd(colWidth));
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

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\n🗺  Chunk seam checker — ${FIX_MODE ? "FIX mode" : "report only"}\n`);

  const coords = discoverChunks();
  console.log(`Found ${coords.length} chunk(s): ${coords.map(([x, z]) => `(${x},${z})`).join(" ")}\n`);

  const chunks = new Map<string, HeightGrid>();
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
    const side =
      m.edge === "east-west"
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
    const [cx, cz] = k.split(",").map(Number) as ChunkCoord;
    writeChunk(cx, cz, chunks.get(k)!, sources.get(k)!);
    console.log(`  ✓ Rewrote (${cx}, ${cz})`);
  }

  console.log("\nDone. Re-run without --fix to verify.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
