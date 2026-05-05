"use client";
import { FC, memo, useEffect, useState } from "react";
import KelvastWordmark from "../1-atoms/KelvastWordmark";

/*
 * Hidden by default. Becomes visible once the user scrolls past the hero
 * (100vh). Uses a single passive scroll listener — no layout thrashing.
 */
const LandingNav: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-5 md:px-12 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      aria-hidden={!visible}
    >
      <KelvastWordmark className="h-6 md:h-8" />
    </nav>
  );
};

export default memo(LandingNav);
