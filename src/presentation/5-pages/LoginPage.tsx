import { FC, memo, PropsWithChildren } from "react";
import LoginForm from "../3-organisms/LoginForm";
import BaseLayout from "../4-layouts/BaseLayout";

interface Props {}

const LoginPage: FC<Props> = () => {
  const handleAuth = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    const { token } = data;
    if (token) {
      localStorage.setItem("mmo-token", token);
      document.cookie = `mmo-token=${token}; path=/; max-age=86400`;
    }
  };

  return (
    <BaseLayout className="bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">MMO Login</h1>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <LoginForm onSubmit={handleAuth} />
        </div>
      </div>
    </BaseLayout>
  );
};

export default memo<PropsWithChildren<Props>>(LoginPage);
