"use client";
import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "../3-organisms/GameCanvas";
import BaseLayout from "../4-layouts/BaseLayout";
import { useGameStore } from "../../utils/game-store";
import { connectWS } from "../../utils/ws-client";
import { browserRequest, HttpError } from "../../utils/http";
import { DEV_MODE } from "../../utils/dev";
import { ROUTE } from "../../config";
import type { GameSessionResponse } from "mmo-shared";

interface Props {}

const GamePage: FC<Props> = () => {
  const router = useRouter();
  const gameSessionToken = useGameStore((s) => s.gameSessionToken);
  const storeGameSession = useGameStore((s) => s.storeGameSession);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEV_MODE) {
      setReady(true);
      return;
    }

    /*
     * Token already in store — player returned to /game without a page
     * reload. Skip the session request and connect immediately.
     */
    if (gameSessionToken) {
      connectWS(gameSessionToken);
      setReady(true);
      return;
    }

    /*
     * No token in store — request a fresh game session. browserRequest
     * throws an HttpError on non-2xx; a 401 means the authToken cookie is
     * absent or expired so we redirect to login. Any other failure shows
     * the inline error state.
     */
    let cancelled = false;

    const requestSession = async () => {
      try {
        const res = await browserRequest<GameSessionResponse>({
          method: "POST",
          url: "/api/game/session",
        });

        if (cancelled) return;

        if (!res.ok) {
          setError(res.message);
          return;
        }

        storeGameSession(res);
        connectWS(res.gameSessionToken);
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        if ((err as HttpError).status === 401) {
          router.push(ROUTE.LOGIN);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to connect. Please try again.");
      }
    };

    requestSession();

    return () => {
      cancelled = true;
    };
  }, [gameSessionToken, storeGameSession, router]);

  if (error) {
    return (
      <BaseLayout className="bg-black">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => router.push(ROUTE.DASHBOARD)}
            className="text-white underline text-sm"
          >
            Back to dashboard
          </button>
        </div>
      </BaseLayout>
    );
  }

  if (!ready) {
    return (
      <BaseLayout className="bg-black">
        <div className="flex items-center justify-center min-h-screen text-white text-xl">
          Connecting...
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout className="bg-black">
      <GameCanvas token={gameSessionToken ?? ""} />
    </BaseLayout>
  );
};

export default memo(GamePage);
