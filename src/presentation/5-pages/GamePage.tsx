"use client";
import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "../3-organisms/GameCanvas";
import BaseLayout from "../4-layouts/BaseLayout";
import { useGameStore } from "../../utils/game-store";
import { browserRequest, HttpError } from "../../utils/http";
import { ROUTE } from "../../config";
import type { GameSessionResponse } from "mmo-shared";

type TokenState = "pending" | "ready" | "error";

interface Props {}

const GamePage: FC<Props> = () => {
  const router = useRouter();
  const gameSessionToken = useGameStore((s) => s.gameSessionToken);
  const storeGameSession = useGameStore((s) => s.storeGameSession);
  const [tokenState, setTokenState] = useState<TokenState>(gameSessionToken ? "ready" : "pending");

  useEffect(() => {
    if (gameSessionToken) {
      setTokenState("ready");
      return;
    }

    let cancelled = false;

    browserRequest<GameSessionResponse>({ method: "POST", url: "/api/game/session" })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error(res.message ?? "Could not start game session");
        storeGameSession(res);
        setTokenState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        if ((err as HttpError).status === 401) {
          router.replace(ROUTE.LOGIN);
          return;
        }
        setTokenState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [gameSessionToken, storeGameSession, router]);

  if (tokenState === "pending") return null;

  if (tokenState === "error") {
    return (
      <BaseLayout centered className="bg-black">
        <p className="text-[var(--color-text-muted)] text-sm">
          Failed to start session.{" "}
          <button
            className="underline text-[var(--color-text)]"
            onClick={() => router.push(ROUTE.DASHBOARD)}
          >
            Go back
          </button>
        </p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout className="bg-black">
      <GameCanvas />
    </BaseLayout>
  );
};

export default memo(GamePage);
