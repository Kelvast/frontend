"use client";
import { FC, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginForm from "../3-organisms/LoginForm";
import BaseLayout from "../4-layouts/BaseLayout";
import { useAuth } from "../../context/auth-context";
import { ROUTE } from "../../config";
import { authRequest } from "../../utils/auth";

const LoginPage: FC = () => {
  const router = useRouter();
  const { setIdentity } = useAuth();

  const handleAuth = async (email: string, password: string) => {
    const res = await authRequest("/api/auth/login", { email, password });
    if (!res.ok) throw new Error(res.message);
    setIdentity({ uuid: res.uuid, playerName: res.playerName });
    router.push(ROUTE.DASHBOARD);
  };

  return (
    <BaseLayout width="narrow" centered>
      <div className="w-full">
        <h1 className="text-2xl font-bold text-center text-[var(--color-text)] mb-6">Sign in</h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-md)]">
          <LoginForm onSubmit={handleAuth} />
          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            No account?{" "}
            <Link
              href={ROUTE.REGISTER}
              className="text-[var(--color-accent)] hover:underline font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default memo(LoginPage);
