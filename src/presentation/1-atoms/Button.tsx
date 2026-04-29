import { FC, memo, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)] disabled:opacity-50",
  ghost:
    "bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-offset)] active:bg-[var(--color-surface-dynamic)] disabled:opacity-40",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-bg)] hover:bg-[var(--color-danger-hover)] active:bg-[var(--color-danger-active)] disabled:opacity-50",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-[var(--radius-sm)]",
  md: "px-4 py-2 text-sm rounded-[var(--radius-md)]",
  lg: "px-8 py-3.5 text-base rounded-[var(--radius-lg)]",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: FC<Props> = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 cursor-pointer select-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        loading ? "cursor-wait" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default memo(Button);
