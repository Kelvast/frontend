import { FC, InputHTMLAttributes, memo, PropsWithChildren } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const LoginInput: FC<Props> = ({ label, className, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input 
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all${className ? " " + className : ""}`}
        {...props}
      />
    </div>
  );
};

export default memo<PropsWithChildren<Props>>(LoginInput);
