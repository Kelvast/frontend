"use client";

import { FC, memo, useState } from "react";
import { BuilderRegion } from "../../types";
import TileGrid from "./TileGrid";
import TilePalette from "./TilePalette";
import ChunkExporter from "./ChunkExporter";
import RegionSelector from "../1-atoms/RegionSelector";
import { ChunkData, TileData, TileHeight, TileType, WORLD, tileData } from "mmo-shared";

function makeEmptyChunk(): TileData[][] {
  return Array.from({ length: WORLD.CHUNK_SIZE }, () =>
    Array.from({ length: WORLD.CHUNK_SIZE }, () => tileData("grass")),
  );
}

function inferRegion(chunkX: number, chunkZ: number, regions: BuilderRegion[]): string {
  const allChunks = regions.flatMap((r) => r.chunks.map((c) => ({ ...c, regionId: r.id })));
  const neighbours = [
    { x: chunkX - 1, z: chunkZ },
    { x: chunkX + 1, z: chunkZ },
    { x: chunkX, z: chunkZ - 1 },
    { x: chunkX, z: chunkZ + 1 },
  ];

  const neighbourRegions = neighbours
    .map((n) => allChunks.find((c) => c.chunkX === n.x && c.chunkZ === n.z)?.regionId)
    .filter((r): r is string => r !== undefined);

  if (neighbourRegions.length === 0) return "";

  const counts = neighbourRegions.reduce<Record<string, number>>((acc, r) => {
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

interface Props {
  chunkX: number;
  chunkZ: number;
  initialRegionId: string;
  initialTiles?: TileData[][];
  regions: BuilderRegion[];
  onSaved: () => void;
  onCreateRegion: (regionId: string) => void;
}

const ChunkEditorPanel: FC<Props> = ({
  chunkX,
  chunkZ,
  initialRegionId,
  initialTiles,
  regions,
  onSaved,
  onCreateRegion,
}) => {
  const isNew = !initialTiles;
  const [tiles, setTiles] = useState<TileData[][]>(() =>
    initialTiles ? initialTiles.map((r) => [...r]) : makeEmptyChunk(),
  );
  const [selectedType, setSelectedType] = useState<TileType>("grass");
  const [selectedHeight, setSelectedHeight] = useState<TileHeight>(TileHeight.GROUND);
  const [regionId, setRegionId] = useState<string>(
    initialRegionId || inferRegion(chunkX, chunkZ, regions),
  );
  const [previousRegionId] = useState<string>(initialRegionId);

  function paintTile(row: number, col: number): void {
    setTiles((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = tileData(selectedType, selectedHeight);
      return next;
    });
  }

  const chunkData: ChunkData = { chunkX, chunkZ, region: regionId, pvp: false, tiles };

  return (
    <div className="flex flex-col gap-4 p-4">
      <RegionSelector
        regions={regions.map((r) => r.id)}
        value={regionId}
        onChange={setRegionId}
        onCreateRegion={onCreateRegion}
      />
      <TilePalette
        selectedType={selectedType}
        selectedHeight={selectedHeight}
        onSelectType={setSelectedType}
        onSelectHeight={setSelectedHeight}
      />
      <TileGrid tiles={tiles} onPaint={paintTile} />
      <ChunkExporter
        chunkData={chunkData}
        regionId={regionId}
        previousRegionId={previousRegionId}
        isNew={isNew}
        onSaved={onSaved}
      />
    </div>
  );
};

export default memo(ChunkEditorPanel);
