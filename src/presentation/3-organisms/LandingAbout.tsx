import { FC, memo } from "react";

const STATS = [
  { value: "3D", label: "Runs entirely in the browser - no download required" },
  { value: "MMO", label: "Persistent shared world - always on" },
  { value: "0", label: "Pay-to-win mechanics, ever" },
];

const LandingAbout: FC = () => {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-24 md:py-32">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-[var(--color-text)] mb-6 leading-tight">
            Built for players, not monetisation.
          </h2>
          <p className="text-[var(--color-text-muted)] text-base leading-relaxed mb-4">
            Kelvast is an MMORPG where everything you earn comes from play. Gear, levels, and
            status are built through time and skill - nothing else.
          </p>
          <p className="text-[var(--color-text-muted)] text-base leading-relaxed">
            No client to install. Open a tab and enter the world. Built on Babylon.js and
            running over WebSockets, the world is always on.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {STATS.map(({ value, label }) => (
            <div
              key={value}
              className="flex items-center gap-5 p-5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <span className="font-heading font-black text-4xl text-[var(--color-accent)] w-14 shrink-0 leading-none">
                {value}
              </span>
              <span className="text-[var(--color-text-muted)] text-sm leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(LandingAbout);
