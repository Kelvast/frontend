import { FC, memo } from "react";

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
            status are built through time and skill — nothing else.
          </p>
          <p className="text-[var(--color-text-muted)] text-base leading-relaxed">
            This is a hobby project built by one person, in the open. It is early, it is
            growing, and it is genuinely free to play.
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] aspect-video flex items-center justify-center">
          <span className="text-[var(--color-text-faint)] text-sm">Screenshot coming soon</span>
        </div>
      </div>
    </section>
  );
};

export default memo(LandingAbout);
