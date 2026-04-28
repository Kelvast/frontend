"use client";
import { FC, memo } from "react";
import { useRouter } from "next/navigation";
import BaseLayout from "../4-layouts/BaseLayout";
import { useGameStore } from "../../utils/game-store";
import { connectWS } from "../../utils/ws-client";
import { ROUTE } from "../../config";

interface Props {}

const DashboardPage: FC<Props> = () => {
  const router = useRouter();
  const gameSessionToken = useGameStore((s) => s.gameSessionToken);

  const handlePlay = () => {
    if (!gameSessionToken) return;
    connectWS(gameSessionToken);
    router.push(ROUTE.GAME);
  };

  return (
    <BaseLayout className="bg-gray-950 text-white justify-center items-center p-8">
      <div className="w-full max-w-lg text-center">
        <button
          onClick={handlePlay}
          disabled={!gameSessionToken}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white text-lg font-bold rounded-2xl transition-colors shadow-lg"
        >
          Play
        </button>
      </div>
    </BaseLayout>
  );
};

export default memo(DashboardPage);
