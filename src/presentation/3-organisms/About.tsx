import { FC, memo } from "react";

const LandingAbout: FC = () => {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-24 md:py-32">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-[var(--color-fg)] mb-6 leading-tight">
            A new world to get lost in.
          </h2>
          <p className="text-[var(--color-fg-muted)] text-base leading-relaxed mb-4">
            Kelvast is built out of passion for the genre. A persistent world, real progression, and
            a game that respects your time. That is what we are making.
          </p>
          <p className="text-[var(--color-fg-muted)] text-base leading-relaxed">
            It is early. The world is small and the feature list is short. But the foundation is
            real, and it is growing.
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] aspect-video flex items-center justify-center">
          <span className="text-[var(--color-fg-faint)] text-sm">Screenshot coming soon</span>
        </div>
      </div>
    </section>
  );
};

export default memo(LandingAbout);
