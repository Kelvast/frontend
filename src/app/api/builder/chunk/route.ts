// src/app/api/builder/chunk/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateChunkTs } from "../../../../utils/chunk-export";
import {
  generateRegionIndexTs,
  generateRegionsRootIndexTs,
} from "../../../../utils/region-index-gen";
import { parseChunkTs } from "../../../../utils/chunk-parse";
import type { ObjectInstance, NpcSpawn } from "mmo-shared";
import { BuilderSaveRequest } from "../../../../types";

const REGIONS_ROOT = path.resolve("src/game-client/world/regions");

function safeChunkPath(
  regionId: string,
  chunkX: string | number,
  chunkZ: string | number,
): string | null {
  if (!/^[a-z0-9-]+$/.test(regionId)) return null;
  if (!/^-?\d+$/.test(String(chunkX)) || !/^-?\d+$/.test(String(chunkZ))) return null;
  const resolved = path.resolve(REGIONS_ROOT, regionId, `${chunkX}_${chunkZ}.ts`);
  if (!resolved.startsWith(REGIONS_ROOT)) return null;
  return resolved;
}

function rebuildRegionIndex(regionId: string): void {
  const regionPath = path.resolve(REGIONS_ROOT, regionId);
  fs.mkdirSync(regionPath, { recursive: true });

  const chunkKeys = fs
    .readdirSync(regionPath)
    .map((f) => f.match(/^(-?\d+)_(-?\d+)\.ts$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => `${m[1]}_${m[2]}`);

  fs.writeFileSync(
    path.resolve(regionPath, "index.ts"),
    generateRegionIndexTs(regionId, chunkKeys),
  );
}

function rebuildRootIndex(): void {
  const regionIds = fs
    .readdirSync(REGIONS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  fs.writeFileSync(path.resolve(REGIONS_ROOT, "index.ts"), generateRegionsRootIndexTs(regionIds));
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const regionId = searchParams.get("regionId") ?? "";
  const chunkX = searchParams.get("chunkX") ?? "";
  const chunkZ = searchParams.get("chunkZ") ?? "";

  const filePath = safeChunkPath(regionId, chunkX, chunkZ);
  if (!filePath) return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  if (!fs.existsSync(filePath))
    return NextResponse.json({ error: "Chunk not found" }, { status: 404 });

  try {
    const source = fs.readFileSync(filePath, "utf-8");
    const parsed = parseChunkTs(source);
    if (!parsed) return NextResponse.json({ error: "Failed to parse chunk file" }, { status: 500 });
    return NextResponse.json({ tiles: parsed.tiles, pvp: parsed.pvp });
  } catch (err) {
    console.error("[builder/chunk GET]", err);
    return NextResponse.json({ error: "Failed to read chunk" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as BuilderSaveRequest;
    const { regionId, chunkX, chunkZ, tiles, pvp, previousRegionId } = body;

    const filePath = safeChunkPath(regionId, chunkX, chunkZ);
    if (!filePath) return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });

    /*
     * Read the existing chunk file before overwriting so that npcSpawns and
     * objects authored directly in the source files are not clobbered by a
     * map-builder tile save. The builder only edits tiles and pvp - all other
     * fields are preserved verbatim from disk.
     */
    let existingObjects: ObjectInstance[] = [];
    let existingNpcSpawns: NpcSpawn[] = [];
    if (fs.existsSync(filePath)) {
      const existing = parseChunkTs(fs.readFileSync(filePath, "utf-8"));
      if (existing) {
        existingObjects = existing.objects;
        existingNpcSpawns = existing.npcSpawns;
      }
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      generateChunkTs({
        chunkX,
        chunkZ,
        region: regionId,
        pvp,
        tiles,
        objects: existingObjects,
        npcSpawns: existingNpcSpawns,
      }),
    );

    if (previousRegionId && previousRegionId !== regionId) {
      const oldPath = safeChunkPath(previousRegionId, chunkX, chunkZ);
      if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      rebuildRegionIndex(previousRegionId);
    }

    rebuildRegionIndex(regionId);
    rebuildRootIndex();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[builder/chunk POST]", err);
    return NextResponse.json({ error: "Failed to save chunk" }, { status: 500 });
  }
}
