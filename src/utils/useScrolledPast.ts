"use client";
import { useEffect, useState } from "react";

export const HERO_SCROLL_THRESHOLD = 600;

const useScrolledPast = (threshold: number): boolean => {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return past;
};

export default useScrolledPast;
