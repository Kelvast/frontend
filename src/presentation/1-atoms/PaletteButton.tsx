import { FC, memo } from "react";

interface Props {
  label: string;
  selected: boolean;
  color?: string;
  onClick: () => void;
}

const PaletteButton: FC<Props> = ({ label, selected, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-2 py-1 rounded text-sm w-full text-left ${selected ? "ring-2 ring-white bg-gray-700" : "hover:bg-gray-700"}`}
  >
    {color && <div className="w-4 h-4 rounded-sm flex-shrink-0 border border-gray-600" style={{ backgroundColor: color }} />}
    {label}
  </button>
);

export default memo(PaletteButton);
