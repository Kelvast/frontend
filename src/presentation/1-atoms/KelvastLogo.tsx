import KelvastIcon from "./KelvastIcon";
import KelvastWordmark from "./KelvastWordmark";

interface KelvastLogoProps {
  className?: string;
  fill?: string;
  variant?: "stacked" | "inline";
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  mobileSize?: "sm" | "md" | "lg" | "xl" | "xxl";
}

const SCALE: Record<NonNullable<KelvastLogoProps["size"]>, number> = {
  sm: 0.85,
  md: 1,
  lg: 1.6,
  xl: 2.4,
  xxl: 3.8,
};

const BASE = {
  iconW: 60,
  iconH: 42,
  wordmarkW: 107.6,
  wordmarkH: 15.6,
};

const KelvastLogo = ({
  className = "",
  fill = "currentColor",
  variant = "stacked",
  size = "md",
  mobileSize = "sm",
}: KelvastLogoProps) => {
  const mobileScale = SCALE[mobileSize];
  const desktopScale = SCALE[size];

  return (
    <div
      className={`flex items-center ${
        variant === "stacked" ? "flex-col gap-4 sm:gap-6" : "flex-row gap-4 sm:gap-6"
      } ${className}`}
    >
      <div className="sm:hidden">
        <KelvastIcon
          fill={fill}
          width={BASE.iconW * mobileScale}
          height={BASE.iconH * mobileScale}
        />
      </div>

      <div className="hidden sm:block">
        <KelvastIcon
          fill={fill}
          width={BASE.iconW * desktopScale}
          height={BASE.iconH * desktopScale}
        />
      </div>

      <div className="sm:hidden">
        <KelvastWordmark
          fill={fill}
          width={BASE.wordmarkW * mobileScale}
          height={BASE.wordmarkH * mobileScale}
        />
      </div>

      <div className="hidden sm:block">
        <KelvastWordmark
          fill={fill}
          width={BASE.wordmarkW * desktopScale}
          height={BASE.wordmarkH * desktopScale}
        />
      </div>
    </div>
  );
};

export default KelvastLogo;
