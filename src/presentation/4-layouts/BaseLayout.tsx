import { FC, memo, PropsWithChildren, ReactNode } from "react";

type Width = "narrow" | "default" | "wide" | "full";

const WIDTH_CLASSES: Record<Width, string> = {
  narrow: "max-w-sm",
  default: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-full",
};

interface Props {
  children?: ReactNode;
  className?: string;
  width?: Width;
  centered?: boolean;
}

const BaseLayout: FC<Props> = ({
  children,
  className = "",
  width = "default",
  centered = false,
}) => {
  return (
    <div
      className={[
        "min-h-screen w-full bg-bg text-fg overflow-x-hidden",
        centered ? "flex flex-col items-center justify-center" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`w-full ${WIDTH_CLASSES[width]} mx-auto px-4`}>
        {children}
      </div>
    </div>
  );
};

export default memo<PropsWithChildren<Props>>(BaseLayout);
