import { FC, memo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const LandingLayout: FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">
      {children}
    </div>
  );
};

export default memo(LandingLayout);
