"use client";
import { FC, memo } from "react";
import { useRouter } from "next/navigation";
import BaseLayout from "../4-layouts/BaseLayout";
import { useGameStore } from "../../utils/game-store";
import { ROUTE } from "../../config";

interface Props {}

const DashboardPage: FC<Props> = () => {
  const router = useRouter();
  const localPlayer = useGameStore((s) => s.localPlayer);

  const handlePlay = () => {
    router.push(ROUTE.GAME);
  };

  return (
    <BaseLayout className="bg-gray-950 text-white justify-center items-center p-8">
      <div className="w-full max-w-lg text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome back{localPlayer ? `, ${localPlayer.name}` : ""}</h1>
        <p className="text-gray-400 text-sm">
          Level {localPlayer?.level ?? "—"} &middot; {localPlayer?.worldName ?? "Unknown world"}
        </p>
        <button
          onClick={handlePlay}
          className="mt-4 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-lg font-bold rounded-2xl transition-colors shadow-lg"
        >
          Play
        </button>
      </div>
    </BaseLayout>
  );
};

export default memo(DashboardPage);
