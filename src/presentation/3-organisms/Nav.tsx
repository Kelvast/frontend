"use client";
import { FC, memo } from "react";
import KelvastWordmark from "../1-atoms/KelvastWordmark";
import useScrolledPast, {
  HERO_SCROLL_THRESHOLD,
} from "../../utils/useScrolledPast";

/*
 * Hidden by default. Becomes visible once the user scrolls past the hero.
 * Threshold shared with LandingHero arrow via HERO_SCROLL_THRESHOLD.
 */
const LandingNav: FC = () => {
  const visible = useScrolledPast(HERO_SCROLL_THRESHOLD);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4 md:px-12 transition-opacity duration-300 bg-gradient-to-b from-black/70 to-transparent"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden={!visible}
    >
      <KelvastWordmark height={24} className="md:h-8" />
    </nav>
  );
};

export default memo(LandingNav);
