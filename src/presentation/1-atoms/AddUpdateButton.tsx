"use client";

import { FC, memo } from "react";
import { SaveState } from "./SaveStatus";

interface Props {
  isNew: boolean;
  saveState: SaveState;
  onSave: () => void;
}

const LABEL: Record<SaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved!",
  error: "Retry",
};

const AddUpdateButton: FC<Props> = ({ isNew, saveState, onSave }) => {
  const idle = saveState === "idle";
  const label = idle ? (isNew ? "Add chunk" : "Update chunk") : LABEL[saveState];

  return (
    <button
      onClick={onSave}
      disabled={saveState === "saving"}
      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-2 rounded text-sm font-medium w-full transition-colors"
    >
      {label}
    </button>
  );
};

export default memo(AddUpdateButton);
