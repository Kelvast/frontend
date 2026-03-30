import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REGIONS_ROOT = path.resolve("src/game-client/world/regions");

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  try {
    if (!fs.existsSync(REGIONS_ROOT)) {
      return NextResponse.json({ regions: [] });
    }

    const entries = fs.readdirSync(REGIONS_ROOT, { withFileTypes: true });
    const regions = entries
      .filter((e) => e.isDirectory())
      .map((e) => {
        const regionId = e.name;
        const regionPath = path.resolve(REGIONS_ROOT, regionId);
        const chunks = fs
          .readdirSync(regionPath)
          .map((f) => f.match(/^(-?\d+)_(-?\d+)\.ts$/))
          .filter((m): m is RegExpMatchArray => m !== null)
          .map((m) => ({ chunkX: Number(m[1]), chunkZ: Number(m[2]) }));
        return { id: regionId, chunks };
      });

    return NextResponse.json({ regions });
  } catch (err) {
    console.error("[builder/regions GET]", err);
    return NextResponse.json({ error: "Failed to read regions" }, { status: 500 });
  }
}
