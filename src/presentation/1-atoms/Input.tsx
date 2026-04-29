"use client";
import { FC, memo, InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: FC<Props> = ({ label, error, id, className = "", ...rest }) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={[
          "w-full px-3 py-2 text-sm rounded-[var(--radius-md)]",
          "bg-[var(--color-surface-offset)] text-[var(--color-text)]",
          "border transition-colors duration-150",
          error
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-border)] focus:border-[var(--color-accent)]",
          "outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20",
          "placeholder:text-[var(--color-text-muted)] disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default memo(Input);
