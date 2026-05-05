import { FC, memo } from "react";

interface Feature {
  tag: string;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    tag: "World",
    title: "A living, persistent world.",
    body: "Kelvast exists whether you are logged in or not. Towns grow, markets shift, and other players leave their mark. Log in and find things have changed.",
  },
  {
    tag: "Combat",
    title: "Skill over spend.",
    body: "Every piece of gear, every ability, every title is earned through play. The best items in the world come from the hardest content — not a shop.",
  },
  {
    tag: "Access",
    title: "No install.",
    body: "Kelvast runs entirely in your browser. Open a tab and you are in.",
  },
];

const LandingFeatures: FC = () => {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-24 md:py-32 border-t border-[var(--color-border)]">
      <div className="flex flex-col gap-24">
        {FEATURES.map(({ tag, title, body }, i) => (
          <div
            key={tag}
            className={`grid md:grid-cols-2 gap-12 items-center ${
              i % 2 !== 0 ? "md:[&>*:first-child]:order-last" : ""
            }`}
          >
            <div>
              <span className="block text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-3">
                {tag}
              </span>
              <h3 className="font-heading font-bold text-2xl md:text-3xl text-[var(--color-text)] mb-4 leading-tight">
                {title}
              </h3>
              <p className="text-[var(--color-text-muted)] text-base leading-relaxed">{body}</p>
            </div>

            <div className="rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] aspect-video flex items-center justify-center">
              <span className="text-[var(--color-text-faint)] text-sm">Screenshot coming soon</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(LandingFeatures);
