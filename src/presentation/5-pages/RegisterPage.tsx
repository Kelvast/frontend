"use client";
import { FC, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RegisterForm from "../3-organisms/RegisterForm";
import BaseLayout from "../4-layouts/BaseLayout";
import { useAuth } from "../../context/auth-context";
import { ROUTE } from "../../config";
import { authRequest } from "../../utils/auth";

const RegisterPage: FC = () => {
  const router = useRouter();
  const { setIdentity } = useAuth();

  const handleRegister = async (playerName: string, email: string, password: string) => {
    const res = await authRequest("/api/auth/register", { playerName, email, password });
    if (!res.ok) throw new Error(res.message);
    setIdentity({ uuid: res.uuid, playerName: res.playerName });
    router.push(ROUTE.DASHBOARD);
  };

  return (
    <BaseLayout width="narrow" centered>
      <div className="w-full">
        <h1 className="text-2xl font-bold text-center text-[var(--color-text)] mb-6">
          Create account
        </h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-md)]">
          <RegisterForm onSubmit={handleRegister} />
          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <Link href={ROUTE.LOGIN} className="text-[var(--color-accent)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export default memo(RegisterPage);
