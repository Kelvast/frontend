import { FC, memo } from "react";

interface Props {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: FC<Props> = ({ zoom, onZoomIn, onZoomOut, onReset }) => (
  <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded px-2 py-1">
    <button
      onClick={onZoomOut}
      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white text-lg leading-none"
    >
      −
    </button>
    <button
      onClick={onReset}
      title="Reset view"
      className="text-xs text-gray-400 hover:text-white w-12 text-center tabular-nums"
    >
      {Math.round(zoom * 100)}%
    </button>
    <button
      onClick={onZoomIn}
      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white text-lg leading-none"
    >
      +
    </button>
  </div>
);

export default memo(ZoomControls);
