import { FC, memo } from "react";

interface Props {
  children: string;
}

const SectionLabel: FC<Props> = ({ children }) => (
  <p className="text-xs text-gray-400 uppercase tracking-wide">{children}</p>
);

export default memo(SectionLabel);
