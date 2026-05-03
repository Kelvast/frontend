import { FC, memo, useEffect, useRef, useState } from "react";
import type { LoadStage } from "../../types/mmo/loading";

interface Props {
  stage: LoadStage;
  detail?: string;
  visible: boolean;
}

/*
 * Stage order must match the actual boot sequence in game-client/index.ts:
 *   authenticating → session → connecting → engine → world → player_data
 * "connected" and "error" are terminal states, not steps.
 */
const STAGES: Exclude<LoadStage, "connected" | "error">[] = [
  "authenticating",
  "session",
  "connecting",
  "engine",
  "world",
  "player_data",
];

const LABELS: Record<LoadStage, string> = {
  authenticating: "Authenticating",
  session:        "Starting session",
  connecting:     "Connecting",
  engine:         "Starting engine",
  world:          "Loading world",
  player_data:    "Loading player",
  connected:      "Connected",
  error:          "Failed to connect",
};

const GameLoader: FC<Props> = ({ stage, detail, visible }) => {
  const currentIndex = STAGES.indexOf(stage as (typeof STAGES)[number]);
  const isError = stage === "error";

  const progress =
    stage === "connected" ? 100
    : isError ? 100
    : ((currentIndex + 1) / STAGES.length) * 100;

  /*
   * Rolling detail log — keeps the last 4 lines so the user can see
   * chunks streaming in during the world stage.
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
      className="fixed inset-0 z-[200] pointer-events-none flex flex-col justify-end"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms ease-out",
      }}
    >
      {/* Full black overlay — hides canvas until connected */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 600ms ease-out",
        }}
      />

      {/* Content sits above the overlay */}
      <div
        className="relative z-10 px-6 pb-5 pt-8"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      >
        {/* Rolling detail log */}
        {detailLog.length > 0 && (
          <div className="mb-3 flex flex-col gap-0.5">
            {detailLog.map((line, i) => (
              <span
                key={i}
                className="block text-xs font-mono"
                style={{
                  color: i === detailLog.length - 1 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
                  opacity: 0.4 + (i / detailLog.length) * 0.6,
                }}
              >
                {line}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div
          className="w-full mb-3"
          style={{ height: "1px", background: "rgba(255,255,255,0.08)" }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: isError ? "#e05555" : "rgba(255,255,255,0.7)",
              transition: "width 400ms ease-out",
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: isError ? "#e05555" : "rgba(255,255,255,0.7)",
                animation: isError ? "none" : "pulse 1.4s ease-in-out infinite",
              }}
            />
            <span
              className="text-xs uppercase"
              style={{
                color: isError ? "#e05555" : "rgba(255,255,255,0.7)",
                letterSpacing: "0.15em",
                fontFamily: "var(--font-heading, monospace)",
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
                className="inline-block rounded-full"
                style={{
                  width: i === currentIndex ? "6px" : "4px",
                  height: i === currentIndex ? "6px" : "4px",
                  background: isError
                    ? "#e05555"
                    : i <= currentIndex
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(255,255,255,0.2)",
                  transition: "all 300ms ease-out",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(GameLoader);
