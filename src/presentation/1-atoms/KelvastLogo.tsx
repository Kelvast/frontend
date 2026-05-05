import KelvastIcon from "./KelvastIcon";
import KelvastWordmark from "./KelvastWordmark";

interface KelvastLogoProps {
  className?: string;
  fill?: string;
  variant?: "stacked" | "inline";
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
}

/*
 * Base dimensions are fixed at the natural SVG proportions.
 * Icon: 482.8w × 338.2h → rendered at 60 × 42 base
 * Wordmark: 870w × 126h → rendered at 108 × 15.6 base
 * Gap: 10px base (stacked)
 * Scale multiplier stretches the container uniformly.
 */
const SCALE: Record<string, number> = {
  sm: 0.85,
  md: 1.2,
  lg: 1.7,
  xl: 2.4,
  xxl: 3.8,
};

const BASE = {
  iconW: 60,
  iconH: 42,
  wordmarkW: 107.6,
  wordmarkH: 15.6,
  gap: 10,
};

const KelvastLogo = ({
  className,
  fill = "currentColor",
  variant = "stacked",
  size = "md",
}: KelvastLogoProps) => {
  const s = SCALE[size];
  const iconW = BASE.iconW * s;
  const iconH = BASE.iconH * s;
  const wordmarkW = BASE.wordmarkW * s;
  const wordmarkH = BASE.wordmarkH * s;
  const gap = BASE.gap * s;

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: variant === "stacked" ? "column" : "row",
        alignItems: "center",
        gap: `${gap}px`,
      }}
    >
      <KelvastIcon fill={fill} width={iconW} height={iconH} />
      <KelvastWordmark fill={fill} width={wordmarkW} height={wordmarkH} />
    </div>
  );
};

export default KelvastLogo;
