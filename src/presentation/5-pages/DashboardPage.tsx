"use client";
import { FC, memo } from "react";
import { useRouter } from "next/navigation";
import BaseLayout from "../4-layouts/BaseLayout";
import Button from "../1-atoms/Button";
import { useAuth } from "../../context/auth-context";
import { ROUTE } from "../../config";

const DashboardPage: FC = () => {
  const router = useRouter();
  const { identity, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push(ROUTE.LOGIN);
  };

  return (
    <BaseLayout centered>
      <div className="text-center">
        {identity && (
          <p className="text-[var(--color-text-muted)] mb-6">Welcome back, {identity.playerName}</p>
        )}
        <div className="flex flex-col items-center gap-3">
          <Button size="lg" onClick={() => router.push(ROUTE.GAME)}>
            Play
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </BaseLayout>
  );
};

export default memo(DashboardPage);
