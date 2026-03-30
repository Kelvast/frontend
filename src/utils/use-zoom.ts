import { useState, useCallback } from "react";

const MIN = 0.25;
const MAX = 4;
const STEP = 0.25;
const SCROLL_SENSITIVITY = 0.001;

export interface UseZoom {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  onWheel: (e: React.WheelEvent) => void;
}

export function useZoom(initial = 1): UseZoom {
  const [zoom, setZoom] = useState(initial);

  const clamp = useCallback((v: number) => Math.min(MAX, Math.max(MIN, v)), []);
  const zoomIn = useCallback(() => setZoom((z) => clamp(parseFloat((z + STEP).toFixed(2)))), [clamp]);
  const zoomOut = useCallback(() => setZoom((z) => clamp(parseFloat((z - STEP).toFixed(2)))), [clamp]);
  const resetZoom = useCallback(() => setZoom(1), []);
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setZoom((z) => clamp(parseFloat((z - e.deltaY * SCROLL_SENSITIVITY).toFixed(3))));
    },
    [clamp],
  );

  return { zoom, zoomIn, zoomOut, resetZoom, onWheel };
}
