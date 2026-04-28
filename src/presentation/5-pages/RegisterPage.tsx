"use client";
import { FC, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RegisterForm from "../3-organisms/RegisterForm";
import BaseLayout from "../4-layouts/BaseLayout";
import { useGameStore } from "../../utils/game-store";
import { ROUTE } from "../../config";
import { authRequest } from "../../utils/auth";

interface Props {}

const RegisterPage: FC<Props> = () => {
  const router = useRouter();
  const setSession = useGameStore((s) => s.setSession);
  const setLocalPlayer = useGameStore((s) => s.setLocalPlayer);

  const handleRegister = async (name: string, email: string, password: string) => {
    const res = await authRequest("/api/auth/register", { name, email, password });
    
    if (!res.ok) {
      throw new Error(res.message);
    }

    setLocalPlayer(res);
    setSession(res);
    router.push(ROUTE.DASHBOARD);
  };

  return (
    <BaseLayout className="bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Create account</h1>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <RegisterForm onSubmit={handleRegister} />
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href={ROUTE.LOGIN} className="text-indigo-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default memo(RegisterPage);
