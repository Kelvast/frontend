"use client";
import { FC, InputHTMLAttributes, memo } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const AuthInput: FC<Props> = ({ label, id, ...props }) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        {...props}
      />
    </div>
  );
};

export default memo(AuthInput);
