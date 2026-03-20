"use client";
import { FC, memo, PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "../3-organisms/GameCanvas";
import BaseLayout from "../4-layouts/BaseLayout";

interface Props {}

const GamePage: FC<Props> = () => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
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
  }, [router]);

  if (!token) {
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
