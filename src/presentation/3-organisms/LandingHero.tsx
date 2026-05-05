import { FC, memo } from "react";
import Link from "next/link";
import Button from "../1-atoms/Button";
import { ROUTE } from "../../config";
import KelvastLogo from "../1-atoms/KelvastLogo";

const LandingHero: FC = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 40%, rgba(240,165,0,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto pt-20">
        <KelvastLogo variant="stacked" size="xxl" fill="var(--color-text)" />

        <p className="text-[var(--color-text-muted)] text-lg md:text-xl leading-relaxed max-w-md">
          A browser-based 3D MMORPG. No installs. No pay-to-win. Just the world.
        </p>

        <Link href={ROUTE.REGISTER} prefetch={false}>
          <Button size="lg">Request Early Access</Button>
        </Link>

        <p className="text-[var(--color-text-faint)] text-xs">
          Your account will be ready. We will let you know when the world opens.
        </p>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-text-faint)]"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
          <rect x="6" y="2" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
          <path d="M7 16l-3-4h6l-3 4z" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </section>
  );
};

export default memo(LandingHero);
