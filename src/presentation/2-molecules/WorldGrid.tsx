"use client";

import { FC, memo, useState } from "react";
import { GridCell } from "../../utils/builder-grid";
import ChunkSlot, { CHUNK_PX } from "../1-atoms/ChunkSlot";

interface Props {
  grid: GridCell[][];
  selectedKey: string | null;
  onSelectChunk: (cell: GridCell) => void;
}

const WorldGrid: FC<Props> = ({ grid, selectedKey, onSelectChunk }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${CHUNK_PX}px)`,
        gap: 0,
      }}
    >
      {grid.flat().map((cell) => {
        const key = `${cell.chunkX},${cell.chunkZ}`;
        return (
          <ChunkSlot
            key={key}
            tiles={cell.chunk?.tiles.length ? cell.chunk.tiles : null}
            selected={selectedKey === key}
            hovered={hoveredKey === key}
            onClick={() => onSelectChunk(cell)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
          />
        );
      })}
    </div>
  );
};

export default memo(WorldGrid);
