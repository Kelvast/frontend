import { FC, memo } from "react";
import KelvastWordmark from "../1-atoms/KelvastWordmark";

const LandingNav: FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-5 md:px-12">
      <KelvastWordmark className="h-6 md:h-8"/>
    </nav>
  );
};

export default memo(LandingNav);
