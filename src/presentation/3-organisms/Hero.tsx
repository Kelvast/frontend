"use client";
import { FC, memo, useEffect, useState } from "react";
import KelvastLogo from "../1-atoms/KelvastLogo";
import useScrolledPast, {
  HERO_SCROLL_THRESHOLD,
} from "../../utils/useScrolledPast";

const LandingHero: FC = () => {
  const [bright, setBright] = useState(false);
  const scrolled = useScrolledPast(HERO_SCROLL_THRESHOLD);

  useEffect(() => {
    const brightenTimer = setTimeout(() => setBright(true), 3000);
    return () => clearTimeout(brightenTimer);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 40%, rgba(212,146,10,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <KelvastLogo
          variant="stacked"
          mobileSize="xl"
          size="xxl"
          fill="var(--color-fg)"
        />

        <p className="text-[var(--color-fg-muted)] text-sm sm:text-base md:text-xl leading-relaxed max-w-md">
          A browser-based 3D MMORPG. No installs.
        </p>
      </div>

      <div
        aria-hidden="true"
        className={[
          "absolute bottom-16 md:bottom-10 left-1/2 -translate-x-1/2 transition-all duration-700",
          scrolled ? "opacity-0 pointer-events-none" : "opacity-100",
          bright ? "text-fg-muted" : "text-fg-faint",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <svg
          className="animate-bounce"
          width="20"
          height="28"
          viewBox="0 0 14 20"
          fill="none"
        >
          <circle cx="7" cy="3" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="7" cy="7" r="1" fill="currentColor" opacity="0.7" />
          <path d="M7 16l-3-4h6l-3 4z" fill="currentColor" opacity="0.7" />
        </svg>
      </div>
    </section>
  );
};

export default memo(LandingHero);
