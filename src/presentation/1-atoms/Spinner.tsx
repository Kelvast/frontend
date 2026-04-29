import { FC, memo } from "react";

interface Props {
  size?: "sm" | "md";
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "w-3.5 h-3.5 border-2",
  md: "w-5 h-5 border-2",
};

const Spinner: FC<Props> = ({ size = "md" }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block rounded-full border-current border-t-transparent animate-spin ${SIZE[size]}`}
  />
);

export default memo(Spinner);
