"use client";
import { FC, memo, PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "../3-organisms/GameCanvas";
import BaseLayout from "../4-layouts/BaseLayout";
import { DEV_MODE } from "../../utils/dev";

interface Props {}

const GamePage: FC<Props> = () => {
  const [token, setToken] = useState<string>("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (DEV_MODE) {
      setReady(true);
      return;
    }

    const storedToken =
      localStorage.getItem("mmo-token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("mmo-token="))
        ?.split("=")[1];

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <BaseLayout className="bg-black">
        <div className="flex items-center justify-center min-h-screen text-white text-xl">
          Loading game...
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout className="bg-black">
      <GameCanvas token={token} />
    </BaseLayout>
  );
};

export default memo<PropsWithChildren<Props>>(GamePage);
