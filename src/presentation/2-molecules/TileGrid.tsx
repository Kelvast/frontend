"use client";

import { FC, memo, useState } from "react";
import type { TileData } from "mmo-shared";
import TileCell from "../1-atoms/TileCell";
import { getTileColor } from "../../game-client/world/tile-colors";

interface Props {
  tiles: TileData[][];
  onPaint: (row: number, col: number) => void;
}

const TileGrid: FC<Props> = ({ tiles, onPaint }) => {
  const [isPainting, setIsPainting] = useState(false);

  return (
    <div
      className="inline-grid gap-px bg-gray-700 select-none"
      style={{ gridTemplateColumns: `repeat(${tiles[0].length}, 28px)` }}
      onMouseDown={() => setIsPainting(true)}
      onMouseUp={() => setIsPainting(false)}
      onMouseLeave={() => setIsPainting(false)}
    >
      {tiles.map((row, rowIdx) =>
        row.map((t, colIdx) => (
          <TileCell
            key={`${rowIdx}-${colIdx}`}
            color={getTileColor(t)}
            onMouseDown={() => onPaint(rowIdx, colIdx)}
            onMouseEnter={() => {
              if (isPainting) onPaint(rowIdx, colIdx);
            }}
          />
        )),
      )}
    </div>
  );
};

export default memo(TileGrid);
