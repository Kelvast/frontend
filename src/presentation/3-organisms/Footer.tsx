import { FC, memo } from "react";
import KelvastWordmark from "../1-atoms/KelvastWordmark";

const LandingFooter: FC = () => {
  return (
    <footer className="w-full border-t border-[var(--color-border)] px-6 py-10 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-heading font-bold text-sm text-[var(--color-fg)]">
          <KelvastWordmark className="h-3" />
        </span>
        <p className="text-[var(--color-fg-faint)] text-xs">
          &copy; {new Date().getFullYear()} Kelvast. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default memo(LandingFooter);
