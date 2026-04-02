import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  generateRegionIndexTs,
  generateRegionsRootIndexTs,
} from "../../../../utils/region-index-gen";

const REGIONS_ROOT = path.resolve("src/game-client/world/regions");

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    const { regionId } = (await request.json()) as { regionId: string };

    if (!/^[a-z0-9-]+$/.test(regionId)) {
      return NextResponse.json(
        { error: "Invalid region id — use lowercase letters, numbers and hyphens only" },
        { status: 400 },
      );
    }

    const regionPath = path.resolve(REGIONS_ROOT, regionId);
    if (!regionPath.startsWith(REGIONS_ROOT)) {
      return NextResponse.json({ error: "Invalid region id" }, { status: 400 });
    }

    if (fs.existsSync(regionPath)) {
      return NextResponse.json({ error: "Region already exists" }, { status: 409 });
    }

    fs.mkdirSync(regionPath, { recursive: true });
    fs.writeFileSync(path.resolve(regionPath, "index.ts"), generateRegionIndexTs(regionId, []));

    const existingIds = fs
      .readdirSync(REGIONS_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== regionId)
      .map((d) => d.name);

    fs.writeFileSync(
      path.resolve(REGIONS_ROOT, "index.ts"),
      generateRegionsRootIndexTs([...existingIds, regionId]),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[builder/region POST]", err);
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 });
  }
}
