"use client";
import { FC, memo } from "react";

interface Props {
  label: string;
  loading: boolean;
}

const AuthButton: FC<Props> = ({ label, loading }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg transition-colors"
  >
    {loading ? "Please wait..." : label}
  </button>
);

export default memo(AuthButton);
