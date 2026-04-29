"use client";
import { FC, memo, useState } from "react";
import { useRouter } from "next/navigation";
import BaseLayout from "../4-layouts/BaseLayout";
import Button from "../1-atoms/Button";
import { useGameStore } from "../../utils/game-store";
import { browserRequest, HttpError } from "../../utils/http";
import { ROUTE } from "../../config";
import type { GameSessionResponse } from "mmo-shared";

interface Props {}

const DashboardPage: FC<Props> = () => {
  const router = useRouter();
  const identity = useGameStore((s) => s.identity);
  const storeGameSession = useGameStore((s) => s.storeGameSession);
  const logout = useGameStore((s) => s.onLogout);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push(ROUTE.LOGIN);
  };

  return (
    <BaseLayout centered>
      <div className="text-center">
        {identity && (
          <p className="text-[var(--color-text-muted)] mb-6">
            Welcome back, {identity.playerName}
          </p>
        )}
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
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
