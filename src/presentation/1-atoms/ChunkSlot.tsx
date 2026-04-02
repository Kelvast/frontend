"use client";

import { FC, memo, useEffect, useRef } from "react";
import type { TileData } from "mmo-shared";
import { WORLD } from "mmo-shared";
import { getTileColor } from "../../game-client/world/tile-colors";

const CELL = 4;
export const CHUNK_PX = WORLD.CHUNK_SIZE * CELL;

interface Props {
  tiles: TileData[][] | null;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ChunkSlot: FC<Props> = ({
  tiles,
  selected,
  hovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!tiles || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    tiles.forEach((row, z) =>
      row.forEach((t, x) => {
        ctx.fillStyle = getTileColor(t);
        ctx.fillRect(x, z, 1, 1);
      }),
    );
  }, [tiles]);

  const overlay = selected
    ? "rgba(96,165,250,0.25)"
    : hovered
      ? "rgba(255,255,255,0.12)"
      : "transparent";

  if (!tiles) {
    return (
      <div
        style={{ width: CHUNK_PX, height: CHUNK_PX, backgroundColor: overlay }}
        className="flex items-center justify-center border border-dashed border-gray-700 hover:border-blue-400 cursor-pointer text-gray-700 hover:text-blue-400 transition-colors text-xl select-none"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        +
      </div>
    );
  }

  return (
    <div
      style={{ width: CHUNK_PX, height: CHUNK_PX, position: "relative", cursor: "pointer" }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={WORLD.CHUNK_SIZE}
        height={WORLD.CHUNK_SIZE}
        style={{ width: CHUNK_PX, height: CHUNK_PX, imageRendering: "pixelated", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: overlay,
          transition: "background-color 0.1s ease",
          pointerEvents: "none",
        }}
      />
      {selected && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            outline: "2px solid rgba(96,165,250,0.8)",
            outlineOffset: "-2px",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export default memo(ChunkSlot);
