import { FC, memo } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  state: SaveState;
  error?: string;
}

const LABELS: Record<SaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Failed",
};

const COLOURS: Record<SaveState, string> = {
  idle: "",
  saving: "text-gray-400",
  saved: "text-green-400",
  error: "text-red-400",
};

const SaveStatus: FC<Props> = ({ state, error }) => {
  if (state === "idle") return null;
  return (
    <div className={`text-xs ${COLOURS[state]}`}>
      {state === "error" && error ? error : LABELS[state]}
    </div>
  );
};

export default memo(SaveStatus);
