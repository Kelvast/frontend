/**
 * One-time script that rewrites chunk .ts files so border tiles taper toward
 * their neighbour's edge heights, eliminating seams without any runtime cost.
 *
 * Run with: npx ts-node --project tsconfig.scripts.json scripts/smooth-chunk-edges.ts
 *
 * Only rewrites border rows/columns (depth 1-2 tiles). Interior tiles are untouched.
 * Safe to re-run — idempotent once borders already match.
 */

import * as fs from "fs";
import * as path from "path";

// ── TileHeight enum (mirrors mmo-shared to avoid a full import) ──────────────

const TileHeight = {
  GROUND: 0,
  SLOPE_LOW: 1,
  SLOPE_LOW_MID: 2,
  SLOPE_MID: 3,
  SLOPE_MID_HIGH: 4,
  SLOPE_HIGH: 5,
  FIRST_FLOOR: 6,
  SECOND_FLOOR: 7,
  THIRD_FLOOR: 8,
} as const;

type TileHeightValue = (typeof TileHeight)[keyof typeof TileHeight];

const HEIGHT_NAME: Record<number, string> = {
  0: "GROUND",
  1: "SLOPE_LOW",
  2: "SLOPE_LOW_MID",
  3: "SLOPE_MID",
  4: "SLOPE_MID_HIGH",
  5: "SLOPE_HIGH",
  6: "FIRST_FLOOR",
  7: "SECOND_FLOOR",
  8: "THIRD_FLOOR",
};

const CHUNK_SIZE = 16;

// ── Chunk layout in spawn region ────────────────────────────────────────────

const CHUNK_COORDS: [number, number][] = [
  [-1, 0],
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [2, 0],
];

const REGIONS_DIR = path.resolve(__dirname, "../src/game-client/world/regions/spawn");

// ── Load chunk tile heights from .ts source ──────────────────────────────────

/*
 * Parses the tile height grid out of a chunk .ts file by matching the
 * TileHeight constant names used in the file. No transpilation needed.
 */
function loadChunkHeights(chunkX: number, chunkZ: number): number[][] | null {
  const fileName = chunkX < 0 ? `-${Math.abs(chunkX)}_${chunkZ}` : `${chunkX}_${chunkZ}`;
  const filePath = path.join(REGIONS_DIR, `${fileName}.ts`);
  if (!fs.existsSync(filePath)) return null;

  const src = fs.readFileSync(filePath, "utf8");

  // Extract all const aliases: e.g. "const Grass_SLOPE_MID = tileData(..., TileHeight.SLOPE_MID)"
  const aliasMap = new Map<string, number>();
  const aliasRe =
    /const\s+(\w+)\s*=\s*tileData\([^,)]+(?:,\s*TileHeight\.(\w+))?\s*(?:,\s*\d+\s*)?\)/g;
  let m: RegExpExecArray | null;
  while ((m = aliasRe.exec(src)) !== null) {
    const alias = m[1];
    const heightName = m[2] ?? "GROUND";
    const heightVal = TileHeight[heightName as keyof typeof TileHeight] ?? 0;
    aliasMap.set(alias, heightVal);
  }

  // Extract the tiles array block
  const tilesMatch = src.match(/tiles:\s*\[([^;]+)\]\s*,?\s*\}/s);
  if (!tilesMatch) {
    console.error(`Could not parse tiles in ${fileName}.ts`);
    return null;
  }

  const tilesBlock = tilesMatch[1];
  // Split into rows (each row is a [...] block)
  const rowRe = /\[([^\]]+)\]/g;
  const grid: number[][] = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(tilesBlock)) !== null) {
    const cells = rowMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const row = cells.map((alias) => aliasMap.get(alias) ?? 0);
    if (row.length === CHUNK_SIZE) grid.push(row);
  }

  return grid.length === CHUNK_SIZE ? grid : null;
}

// ── Build flat world tile map ────────────────────────────────────────────────

type TileMap = Map<string, number>;

function buildTileMap(grids: Map<string, number[][]>): TileMap {
  const map: TileMap = new Map();
  for (const [[cx, cz], grid] of [...grids.entries()].map(
    ([k, v]) => [k.split(",").map(Number) as [number, number], v] as const,
  )) {
    for (let row = 0; row < CHUNK_SIZE; row++) {
      for (let col = 0; col < CHUNK_SIZE; col++) {
        map.set(`${cx * CHUNK_SIZE + col},${cz * CHUNK_SIZE + row}`, grid[row][col]);
      }
    }
  }
  return map;
}

function getHeight(map: TileMap, tileX: number, tileZ: number): number | null {
  return map.get(`${tileX},${tileZ}`) ?? null;
}

// ── Smoothing logic ──────────────────────────────────────────────────────────

/*
 * For each border tile, blend its height toward the neighbour's mirrored edge
 * tile using a weighted average. depth=0 is the outermost border tile (blends
 * 50/50 with neighbour), depth=1 is one tile in (blends 25/75).
 */
function blendHeight(own: number, neighbour: number, depth: number): number {
  const weight = depth === 0 ? 0.5 : 0.25;
  return Math.round(own * (1 - weight) + neighbour * weight);
}

function clampHeight(h: number): TileHeightValue {
  return Math.max(0, Math.min(5, h)) as TileHeightValue;
}

/*
 * Returns a smoothed copy of the grid with border tiles tapered toward
 * their neighbours in the flat tile map.
 */
function smoothGrid(
  chunkX: number,
  chunkZ: number,
  grid: number[][],
  tileMap: TileMap,
): number[][] {
  const out: number[][] = grid.map((row) => [...row]);

  for (let depth = 0; depth < 2; depth++) {
    // North border (row = depth) — neighbour is at row = -1-depth relative
    for (let col = 0; col < CHUNK_SIZE; col++) {
      const tileX = chunkX * CHUNK_SIZE + col;
      const tileZ = chunkZ * CHUNK_SIZE + depth;
      const neighbourZ = chunkZ * CHUNK_SIZE - 1 - depth;
      const n = getHeight(tileMap, tileX, neighbourZ);
      if (n !== null) {
        out[depth][col] = clampHeight(blendHeight(out[depth][col], n, depth));
      }
    }

    // South border (row = 15 - depth)
    for (let col = 0; col < CHUNK_SIZE; col++) {
      const tileX = chunkX * CHUNK_SIZE + col;
      const tileZ = chunkZ * CHUNK_SIZE + (CHUNK_SIZE - 1 - depth);
      const neighbourZ = chunkZ * CHUNK_SIZE + CHUNK_SIZE + depth;
      const n = getHeight(tileMap, tileX, neighbourZ);
      if (n !== null) {
        out[CHUNK_SIZE - 1 - depth][col] = clampHeight(
          blendHeight(out[CHUNK_SIZE - 1 - depth][col], n, depth),
        );
      }
    }

    // West border (col = depth)
    for (let row = 0; row < CHUNK_SIZE; row++) {
      const tileX = chunkX * CHUNK_SIZE + depth;
      const tileZ = chunkZ * CHUNK_SIZE + row;
      const neighbourX = chunkX * CHUNK_SIZE - 1 - depth;
      const n = getHeight(tileMap, neighbourX, tileZ);
      if (n !== null) {
        out[row][depth] = clampHeight(blendHeight(out[row][depth], n, depth));
      }
    }

    // East border (col = 15 - depth)
    for (let row = 0; row < CHUNK_SIZE; row++) {
      const tileX = chunkX * CHUNK_SIZE + (CHUNK_SIZE - 1 - depth);
      const tileZ = chunkZ * CHUNK_SIZE + row;
      const neighbourX = chunkX * CHUNK_SIZE + CHUNK_SIZE + depth;
      const n = getHeight(tileMap, neighbourX, tileZ);
      if (n !== null) {
        out[row][CHUNK_SIZE - 1 - depth] = clampHeight(
          blendHeight(out[row][CHUNK_SIZE - 1 - depth], n, depth),
        );
      }
    }
  }

  return out;
}

// ── Write chunk .ts file ─────────────────────────────────────────────────────

function heightToAlias(h: number, type: string): string {
  if (h === 0) return type;
  return `${type}_${HEIGHT_NAME[h]}`;
}

function writeChunkFile(chunkX: number, chunkZ: number, grid: number[][]): void {
  const usedHeights = new Set(grid.flat());
  const type = "Grass"; // all current chunks are grass

  const aliases: string[] = [];
  aliases.push(`const ${type} = tileData("grass");`);
  for (const h of [1, 2, 3, 4, 5]) {
    if (usedHeights.has(h)) {
      aliases.push(
        `const ${type}_${HEIGHT_NAME[h]} = tileData("grass", TileHeight.${HEIGHT_NAME[h]});`,
      );
    }
  }

  const rows = grid
    .map((row) => {
      const cells = row.map((h) => `      ${heightToAlias(h, type)},`).join("\n");
      return `    [\n${cells}\n    ]`;
    })
    .join(",\n");

  const src = `import { ChunkData, tileData, TileHeight } from "mmo-shared";

${aliases.join("\n")}

export default {
  pvp: false,
  tiles: [
${rows},
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
`;

  const fileName = chunkX < 0 ? `-${Math.abs(chunkX)}_${chunkZ}` : `${chunkX}_${chunkZ}`;
  const filePath = path.join(REGIONS_DIR, `${fileName}.ts`);
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`✓ Wrote ${fileName}.ts`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
  console.log("Loading chunk data...");

  const grids = new Map<string, number[][]>();
  for (const [cx, cz] of CHUNK_COORDS) {
    const grid = loadChunkHeights(cx, cz);
    if (!grid) {
      console.error(`✗ Could not load chunk (${cx}, ${cz}) — aborting`);
      process.exit(1);
    }
    grids.set(`${cx},${cz}`, grid);
    console.log(`  Loaded (${cx}, ${cz})`);
  }

  console.log("\nBuilding flat tile map...");
  const tileMap = buildTileMap(grids);

  console.log("Smoothing borders...");
  for (const [cx, cz] of CHUNK_COORDS) {
    const grid = grids.get(`${cx},${cz}`)!;
    const smoothed = smoothGrid(cx, cz, grid, tileMap);
    writeChunkFile(cx, cz, smoothed);
  }

  console.log("\nDone. Re-run if you add new chunks.");
}

main();
