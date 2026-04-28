"use client";
import { FC, memo, PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../3-organisms/LoginForm";
import BaseLayout from "../4-layouts/BaseLayout";
import { loginRequest } from "../../utils/auth";
import { useGameStore } from "../../utils/game-store";
import { connectWS } from "../../utils/ws-client";

interface Props {}

const LoginPage: FC<Props> = () => {
  const router = useRouter();
  const setSession = useGameStore((s) => s.setSession);

  const handleAuth = async (email: string, password: string) => {
    const res = await loginRequest({ email, password });

    if (!res.ok) {
      throw new Error(res.message);
    }

    setSession({
      sessionToken: res.sessionToken,
      sessionExpiresAt: res.sessionExpiresAt,
    });
    connectWS(res.sessionToken);
    router.push("/game");
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
