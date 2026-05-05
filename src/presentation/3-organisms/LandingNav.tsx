import { FC, memo } from "react";

const LandingNav: FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-5 md:px-12">
      <span className="font-heading font-black text-xl tracking-tight text-[var(--color-text)]">
        Kelvast
      </span>
    </nav>
  );
};

export default memo(LandingNav);
