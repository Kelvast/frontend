#!/usr/bin/env node
/**
 * Diagnostic tool for chunk border height mismatches and slope easing.
 *
 * Usage:
 *   npx tsx scripts/chunk-seams/index.ts               — report mismatches only
 *   npx tsx scripts/chunk-seams/index.ts --fix          — snap mismatched border tiles
 *   npx tsx scripts/chunk-seams/index.ts --ease         — smooth interior slope gradients
 *   npx tsx scripts/chunk-seams/index.ts --fix --ease   — fix seams then ease slopes
 *
 * When both flags are given, --fix runs first so easing starts from a
 * seam-consistent state.
 */

import * as readline from "readline";
import { discoverChunks } from "./discovery";
import { parseChunk } from "./parse";
import { checkSeams, applyFixes } from "./seams";
import { easeChunk } from "./ease";
import { writeChunk } from "./write";
import { HEIGHT_NAME, ChunkCoord, TileGrid, MAX_SLOPE_STEP } from "./types";

const FIX_MODE = process.argv.includes("--fix");
const EASE_MODE = process.argv.includes("--ease");

async function confirm(question: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (answer.toLowerCase() !== "y") {
        console.log("Aborted.");
        process.exit(0);
      }
      resolve();
    });
  });
}

async function main(): Promise<void> {
  const modeLabel =
    [FIX_MODE && "fix", EASE_MODE && "ease"].filter(Boolean).join(" + ") || "report only";
  console.log(`\n🗺  Chunk seam checker — ${modeLabel}\n`);

  const coords = discoverChunks();
  console.log(
    `Found ${coords.length} chunk(s): ${coords.map(([x, z]) => `(${x},${z})`).join(" ")}\n`,
  );

  const chunks = new Map<string, TileGrid>();

  for (const [cx, cz] of coords) {
    const grid = parseChunk(cx, cz);
    if (!grid) {
      console.error(`✗ Failed to parse chunk (${cx}, ${cz})`);
      process.exit(1);
    }
    chunks.set(`${cx},${cz}`, grid);
  }

  // ── Phase 1: seam check / fix ──────────────────────────────────────────────

  const mismatches = checkSeams(chunks, coords);

  if (mismatches.length === 0) {
    console.log("✅ No seam mismatches found.\n");
  } else {
    console.log(`⚠️  Found ${mismatches.length} seam mismatch(es):\n`);
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
      console.log("\nRun with --fix to snap mismatched border tiles.");
    } else {
      await confirm(`\nFix ${mismatches.length} seam tile(s)? [y/N] `);
      const dirty = applyFixes(mismatches, chunks);
      for (const k of dirty) {
        const [cx, cz] = k.split(",").map(Number) as ChunkCoord;
        writeChunk(cx, cz, chunks.get(k)!);
        console.log(`  ✓ Fixed seams in (${cx}, ${cz})`);
      }
    }
    console.log();
  }

  // ── Phase 2: slope easing ─────────────────────────────────────────────────

  if (!EASE_MODE) {
    if (mismatches.length > 0 && !FIX_MODE) {
      console.log("Run with --fix --ease to fix seams and smooth slopes in one pass.");
    }
    return;
  }

  console.log(`🔧 Easing slopes (max step ${MAX_SLOPE_STEP} between adjacent interior tiles)...\n`);

  const easeDirty = new Set<string>();
  for (const [cx, cz] of coords) {
    const k = `${cx},${cz}`;
    if (easeChunk(chunks.get(k)!)) easeDirty.add(k);
  }

  if (easeDirty.size === 0) {
    console.log("✅ All interior slopes already within tolerance.");
    return;
  }

  console.log(
    `⚠️  ${easeDirty.size} chunk(s) have interior tiles exceeding MAX_SLOPE_STEP=${MAX_SLOPE_STEP}:\n`,
  );
  for (const k of easeDirty) {
    const [cx, cz] = k.split(",").map(Number);
    console.log(`  (${cx}, ${cz})`);
  }

  await confirm(`\nWrite ${easeDirty.size} eased chunk(s)? [y/N] `);

  for (const k of easeDirty) {
    const [cx, cz] = k.split(",").map(Number) as ChunkCoord;
    writeChunk(cx, cz, chunks.get(k)!);
    console.log(`  ✓ Eased (${cx}, ${cz})`);
  }

  console.log("\nDone. Re-run without --fix/--ease to verify.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
