import { FC, memo, useEffect, useRef, useState } from "react";
import type { LoadStage, LoadEvent } from "../../types/mmo/loading";

interface Props {
  stage: LoadStage;
  detail?: string;
}

const STAGES: Exclude<LoadStage, "connected" | "error">[] = [
  "authenticating",
  "engine",
  "world",
  "connecting",
  "session",
  "player_data",
];

const LABELS: Record<LoadStage, string> = {
  authenticating: "Authenticating",
  engine: "Starting engine",
  world: "Loading world",
  connecting: "Connecting",
  session: "Opening session",
  player_data: "Loading player",
  connected: "Connected",
  error: "Failed to connect",
};

const GameLoader: FC<Props> = ({ stage, detail }) => {
  const currentIndex = STAGES.indexOf(stage as (typeof STAGES)[number]);
  const progress =
    stage === "connected"
      ? 100
      : stage === "error"
        ? 100
        : ((currentIndex + 1) / STAGES.length) * 100;

  const isError = stage === "error";

  /*
   * Rolling detail log — keeps the last 4 detail lines so the user can
   * see chunks being loaded as they stream in.
   */
  const [detailLog, setDetailLog] = useState<string[]>([]);
  const prevDetail = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!detail || detail === prevDetail.current) return;
    prevDetail.current = detail;
    setDetailLog((prev) => [...prev.slice(-3), detail]);
  }, [detail]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-5 pt-8"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}
    >
      {/* Rolling detail log */}
      {detailLog.length > 0 && (
        <div className="mb-3 flex flex-col gap-0.5">
          {detailLog.map((line, i) => (
            <span
              key={i}
              className="block text-xs font-mono"
              style={{
                color:
                  i === detailLog.length - 1
                    ? "var(--color-text-muted)"
                    : "var(--color-text-faint)",
                opacity: 0.4 + (i / detailLog.length) * 0.6,
              }}
            >
              {line}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-px mb-3" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: isError ? "var(--color-danger)" : "var(--color-accent)",
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: isError ? "var(--color-danger)" : "var(--color-accent)",
              animation: isError ? "none" : "pulse 1.4s ease-in-out infinite",
            }}
          />
          <span
            className="text-xs uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-heading)",
              color: isError ? "var(--color-danger)" : "var(--color-accent)",
              letterSpacing: "0.15em",
            }}
          >
            {LABELS[stage]}
          </span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {STAGES.map((s, i) => (
            <span
              key={s}
              className="inline-block w-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: isError
                  ? "var(--color-danger)"
                  : i <= currentIndex
                    ? "var(--color-accent)"
                    : "var(--color-text-faint)",
                transform: i === currentIndex ? "scale(1.5)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(GameLoader);
