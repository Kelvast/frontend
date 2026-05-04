import { TileHeight } from "mmo-shared";
import { withHeight } from "./palette";
import { CHUNK_SIZE, MAX_SLOPE_STEP, TileGrid } from "./types";

const CARDINALS: [number, number][] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

/*
 * Relaxation pass over a single chunk's interior tiles.
 * Border tiles (row 0, row CHUNK_SIZE-1, col 0, col CHUNK_SIZE-1) are read as
 * anchors but never written — they are the seam contract with neighbours.
 *
 * Each pass clamps every interior tile to within MAX_SLOPE_STEP of each
 * cardinal neighbour. Repeats until stable (guaranteed convergence — each
 * pass can only reduce deltas, never increase them).
 *
 * TileHeight runs from DECLINE_FULL (-8) to INCLINE_FULL (8). The clamp is
 * applied inside the neighbour loop so intermediate values never leave this
 * range before withHeight() is called.
 *
 * Returns true if any tile was modified.
 */
export function easeChunk(grid: TileGrid): boolean {
  let anyChanged = false;

  let changed = true;
  while (changed) {
    changed = false;
    for (let row = 1; row < CHUNK_SIZE - 1; row++) {
      for (let col = 1; col < CHUNK_SIZE - 1; col++) {
        const current = grid[row][col];
        let h = current.y as number;

        for (const [dr, dc] of CARDINALS) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr < 0 || nr >= CHUNK_SIZE || nc < 0 || nc >= CHUNK_SIZE) continue;
          const nh = grid[nr][nc].y as number;
          if (h - nh > MAX_SLOPE_STEP) h = nh + MAX_SLOPE_STEP;
          if (nh - h > MAX_SLOPE_STEP) h = nh - MAX_SLOPE_STEP;
          h = Math.max(TileHeight.DECLINE_FULL, Math.min(TileHeight.INCLINE_FULL, h));
        }

        const clamped = h as TileHeight;
        if (clamped !== current.y) {
          grid[row][col] = withHeight(current, clamped);
          changed = true;
          anyChanged = true;
        }
      }
    }
  }

  return anyChanged;
}
