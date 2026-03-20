import { FC, memo, PropsWithChildren, ReactNode } from "react";

interface Props {
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const LoginButton: FC<Props> = ({ loading = false, onClick, className }) => {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors${className ? " " + className : ""}`}
    >
      {loading ? "Logging in..." : "Login to MMO"}
    </button>
  );
};

export default memo<PropsWithChildren<Props>>(LoginButton);
