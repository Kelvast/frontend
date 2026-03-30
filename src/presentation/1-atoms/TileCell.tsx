import { FC, memo } from "react";

interface Props {
  color: string;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}

const TileCell: FC<Props> = ({ color, onMouseDown, onMouseEnter }) => (
  <div
    style={{ backgroundColor: color, width: 28, height: 28 }}
    className="cursor-pointer hover:brightness-125 transition-all"
    onMouseDown={onMouseDown}
    onMouseEnter={onMouseEnter}
  />
);

export default memo(TileCell);
