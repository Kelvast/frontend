import { FC, memo } from "react";

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const BuilderInput: FC<Props> = ({ label, value, onChange }) => (
  <div className="flex gap-2 items-center">
    <label className="text-sm text-gray-300 w-16">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-16 bg-gray-700 px-2 py-1 rounded text-sm text-white"
    />
  </div>
);

export default memo(BuilderInput);
