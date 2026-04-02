"use client";

import { FC, useState, useEffect, useCallback, useRef } from "react";
import { BuilderRegion, BuilderRegionsResponse } from "../../types";
import { buildWorldGrid, GridCell } from "../../utils/builder-grid";
import { useFocusZoom } from "../../utils/use-focus-zoom";
import { CHUNK_PX } from "../1-atoms/ChunkSlot";
import WorldGrid from "../2-molecules/WorldGrid";
import ChunkEditorPanel from "../2-molecules/ChunkEditorPanel";
import ZoomControls from "../1-atoms/ZoomControls";
import { Region, ChunkData, TileData } from "mmo-shared";

type TileCache = Map<string, TileData[][]>;

function builderRegionsToRegions(builderRegions: BuilderRegion[], cache: TileCache): Region[] {
  return builderRegions.map((br) => ({
    id: br.id,
    name: br.id,
    chunks: Object.fromEntries(
      br.chunks.map((c) => {
        const key = `${br.id}/${c.chunkX},${c.chunkZ}`;
        return [
          `${c.chunkX},${c.chunkZ}`,
          {
            chunkX: c.chunkX,
            chunkZ: c.chunkZ,
            region: br.id,
            pvp: false,
            tiles: cache.get(key) ?? [],
          } as ChunkData,
        ];
      }),
    ),
  }));
}

function getGridOffset(
  chunkX: number,
  chunkZ: number,
  grid: GridCell[][],
): { px: number; pz: number } {
  const allChunks = grid.flat().filter((c) => c.chunk);
  const minX = allChunks.length ? Math.min(...allChunks.map((c) => c.chunkX)) - 1 : 0;
  const minZ = allChunks.length ? Math.min(...allChunks.map((c) => c.chunkZ)) - 1 : 0;
  const cols = grid[0]?.length ?? 1;
  const rows = grid.length;

  const colIndex = chunkX - minX;
  const rowIndex = chunkZ - minZ;

  const gridTotalW = cols * CHUNK_PX;
  const gridTotalH = rows * CHUNK_PX;

  // pixel center of chunk relative to grid center (not grid origin)
  return {
    px: (colIndex + 0.5) * CHUNK_PX - gridTotalW / 2,
    pz: (rowIndex + 0.5) * CHUNK_PX - gridTotalH / 2,
  };
}

const MapBuilder: FC = () => {
  const [regions, setRegions] = useState<BuilderRegion[]>([]);
  const [tileCache, setTileCache] = useState<TileCache>(new Map());
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const {
    zoom,
    translate,
    isPanning,
    focusChunk,
    manualZoomIn,
    manualZoomOut,
    resetView,
    attachWheel,
  } = useFocusZoom();

  const fetchChunkTiles = useCallback(
    async (regionId: string, chunkX: number, chunkZ: number): Promise<TileData[][] | null> => {
      const res = await fetch(
        `/api/builder/chunk?regionId=${regionId}&chunkX=${chunkX}&chunkZ=${chunkZ}`,
      );
      if (!res.ok) return null;
      const { tiles } = await res.json();
      return tiles as TileData[][];
    },
    [],
  );

  const fetchRegions = useCallback(async () => {
    const res = await fetch("/api/builder/regions");
    const data: BuilderRegionsResponse = await res.json();
    setRegions(data.regions);

    const entries = await Promise.all(
      data.regions.flatMap((r) =>
        r.chunks.map(async (c) => {
          const key = `${r.id}/${c.chunkX},${c.chunkZ}`;
          const tiles = await fetchChunkTiles(r.id, c.chunkX, c.chunkZ);
          return [key, tiles] as [string, TileData[][] | null];
        }),
      ),
    );
    setTileCache(new Map(entries.filter((e): e is [string, TileData[][]] => e[1] !== null)));
  }, [fetchChunkTiles]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleViewportRef = useCallback(
    (el: HTMLDivElement | null) => {
      (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      attachWheel(el);
    },
    [attachWheel],
  );

  const grid = buildWorldGrid(builderRegionsToRegions(regions, tileCache));

  function handleSelectChunk(cell: GridCell): void {
    const isSame = selectedCell?.chunkX === cell.chunkX && selectedCell?.chunkZ === cell.chunkZ;

    if (isSame) {
      setSelectedCell(null);
      resetView();
      return;
    }

    setSelectedCell(cell);

    if (viewportRef.current) {
      const { px, pz } = getGridOffset(cell.chunkX, cell.chunkZ, grid);
      focusChunk(px, pz);
    }
  }

  async function handleCreateRegion(regionId: string): Promise<void> {
    await fetch("/api/builder/region", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regionId }),
    });
    await fetchRegions();
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div
        ref={handleViewportRef}
        className={`flex-1 overflow-hidden relative ${isPanning ? "cursor-grabbing" : "cursor-default"}`}
      >
        <div className="absolute top-4 right-4 z-10">
          <ZoomControls
            zoom={zoom}
            onZoomIn={manualZoomIn}
            onZoomOut={manualZoomOut}
            onReset={resetView}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${translate.x}px), calc(-50% + ${translate.y}px)) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {grid.length > 0 && (
            <WorldGrid
              grid={grid}
              selectedKey={selectedCell ? `${selectedCell.chunkX},${selectedCell.chunkZ}` : null}
              onSelectChunk={handleSelectChunk}
            />
          )}
        </div>
      </div>

      {selectedCell && (
        <div className="w-124 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div>
              <p className="font-medium">
                Chunk {selectedCell.chunkX}, {selectedCell.chunkZ}
              </p>
              <p className="text-xs text-gray-400">{selectedCell.chunk?.region ?? "New chunk"}</p>
            </div>
            <button
              onClick={() => handleSelectChunk(selectedCell)}
              className="text-gray-500 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChunkEditorPanel
              key={`${selectedCell.chunkX}-${selectedCell.chunkZ}`}
              chunkX={selectedCell.chunkX}
              chunkZ={selectedCell.chunkZ}
              initialRegionId={selectedCell.chunk?.region ?? ""}
              initialTiles={selectedCell.chunk?.tiles.length ? selectedCell.chunk.tiles : undefined}
              regions={regions}
              onSaved={fetchRegions}
              onCreateRegion={handleCreateRegion}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBuilder;
