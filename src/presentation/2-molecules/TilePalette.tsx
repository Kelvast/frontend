"use client";

import { FC, memo } from "react";
import { TileHeight, TileType, TILE_WALKABLE } from "mmo-shared";
import { TILE_COLORS } from "../../game-client/world/tile-colors";
import PaletteButton from "../1-atoms/PaletteButton";
import SectionLabel from "../1-atoms/SectionLabel";

interface Props {
  selectedType: TileType;
  selectedHeight: TileHeight;
  onSelectType: (t: TileType) => void;
  onSelectHeight: (h: TileHeight) => void;
}

const TILE_TYPES = Object.keys(TILE_WALKABLE) as TileType[];
const HEIGHTS = Object.entries(TileHeight).filter(
  (entry): entry is [string, TileHeight] => typeof entry[1] === "number",
);

const TilePalette: FC<Props> = ({ selectedType, selectedHeight, onSelectType, onSelectHeight }) => (
  <div className="flex flex-col gap-4">
    <div>
      <SectionLabel>Tile Type</SectionLabel>
      <div className="flex flex-col gap-1 mt-2">
        {TILE_TYPES.map((t) => (
          <PaletteButton
            key={t}
            label={t}
            selected={selectedType === t}
            color={TILE_COLORS[t]}
            onClick={() => onSelectType(t)}
          />
        ))}
      </div>
    </div>
    <div>
      <SectionLabel>Height</SectionLabel>
      <div className="flex flex-col gap-1 mt-2">
        {HEIGHTS.map(([label, value]) => (
          <PaletteButton
            key={label}
            label={label}
            selected={selectedHeight === value}
            onClick={() => onSelectHeight(value)}
          />
        ))}
      </div>
    </div>
  </div>
);

export default memo(TilePalette);
