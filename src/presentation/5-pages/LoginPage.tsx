"use client";
import { FC, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginForm from "../3-organisms/LoginForm";
import BaseLayout from "../4-layouts/BaseLayout";
import { useGameStore } from "../../utils/game-store";
import { ROUTE } from "../../config";
import { authRequest } from "../../utils/auth";

interface Props {}

const LoginPage: FC<Props> = () => {
  const router = useRouter();
  const storeIdentity = useGameStore((s) => s.storeIdentity);

  const handleAuth = async (email: string, password: string) => {
    const res = await authRequest("/api/auth/login", { email, password });

    if (!res.ok) {
      throw new Error(res.message);
    }

    storeIdentity({ uuid: res.uuid, name: res.name });
    router.push(ROUTE.DASHBOARD);
  };

  return (
    <BaseLayout className="bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Sign in</h1>
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <LoginForm onSubmit={handleAuth} />
          <p className="mt-4 text-center text-sm text-gray-600">
            No account?{" "}
            <Link href={ROUTE.REGISTER} className="text-indigo-600 hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default memo(LoginPage);
